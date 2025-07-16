import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
    donor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    charity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Charity',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'ETH',
        enum: ['ETH', 'MATIC', 'USD']
    },
    message: {
        type: String,
        maxlength: 500,
        default: ''
    },
    isAnonymous: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'failed', 'refunded'],
        default: 'pending'
    },
    transactionHash: {
        type: String,
        unique: true,
        sparse: true
    },
    blockchainId: {
        type: Number,
        unique: true,
        sparse: true
    },
    blockNumber: {
        type: Number,
        default: null
    },
    gasUsed: {
        type: Number,
        default: null
    },
    gasFee: {
        type: Number,
        default: 0
    },
    exchangeRate: {
        type: Number,
        default: 1
    },
    usdAmount: {
        type: Number,
        default: 0
    },
    paymentMethod: {
        type: String,
        enum: ['metamask', 'walletconnect', 'coinbase', 'other'],
        default: 'metamask'
    },
    donorWalletAddress: {
        type: String,
        required: true
    },
    recipientWalletAddress: {
        type: String,
        required: true
    },
    isRefunded: {
        type: Boolean,
        default: false
    },
    refundTransactionHash: {
        type: String,
        default: null
    },
    refundedAt: {
        type: Date,
        default: null
    },
    refundReason: {
        type: String,
        default: null
    },
    metadata: {
        userAgent: String,
        ipAddress: String,
        country: String,
        platform: String
    },
    tags: [String],
    notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Indexes
donationSchema.index({ donor: 1 });
donationSchema.index({ project: 1 });
donationSchema.index({ charity: 1 });
donationSchema.index({ status: 1 });
donationSchema.index({ transactionHash: 1 });
donationSchema.index({ donorWalletAddress: 1 });
donationSchema.index({ createdAt: -1 });
donationSchema.index({ amount: -1 });
donationSchema.index({ project: 1, status: 1 });
donationSchema.index({ donor: 1, createdAt: -1 });
donationSchema.index({ charity: 1, createdAt: -1 });

// Virtuals
donationSchema.virtual('formattedAmount').get(function () {
    return `${this.amount} ${this.currency}`;
});

donationSchema.virtual('usdEquivalent').get(function () {
    return this.usdAmount || (this.amount * this.exchangeRate);
});

donationSchema.virtual('isRecent').get(function () {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return this.createdAt > oneDayAgo;
});

// Middleware
donationSchema.pre('save', function (next) {
    if (this.isModified('amount') || this.isModified('exchangeRate')) {
        this.usdAmount = this.amount * this.exchangeRate;
    }
    next();
});

// Statics
donationSchema.statics.getStatistics = async function (filter = {}) {
    const stats = await this.aggregate([
        { $match: { status: 'confirmed', ...filter } },
        {
            $group: {
                _id: null,
                totalAmount: { $sum: '$amount' },
                totalUsdAmount: { $sum: '$usdAmount' },
                totalDonations: { $sum: 1 },
                averageAmount: { $avg: '$amount' },
                uniqueDonors: { $addToSet: '$donor' },
                uniqueProjects: { $addToSet: '$project' },
                uniqueCharities: { $addToSet: '$charity' }
            }
        },
        {
            $project: {
                _id: 0,
                totalAmount: 1,
                totalUsdAmount: 1,
                totalDonations: 1,
                averageAmount: 1,
                uniqueDonorsCount: { $size: '$uniqueDonors' },
                uniqueProjectsCount: { $size: '$uniqueProjects' },
                uniqueCharitiesCount: { $size: '$uniqueCharities' }
            }
        }
    ]);

    return stats[0] || {
        totalAmount: 0,
        totalUsdAmount: 0,
        totalDonations: 0,
        averageAmount: 0,
        uniqueDonorsCount: 0,
        uniqueProjectsCount: 0,
        uniqueCharitiesCount: 0
    };
};

donationSchema.statics.getTopDonors = async function (limit = 10, filter = {}) {
    return this.aggregate([
        { $match: { status: 'confirmed', isAnonymous: false, ...filter } },
        {
            $group: {
                _id: '$donor',
                totalAmount: { $sum: '$amount' },
                totalUsdAmount: { $sum: '$usdAmount' },
                donationCount: { $sum: 1 },
                lastDonation: { $max: '$createdAt' }
            }
        },
        { $sort: { totalAmount: -1 } },
        { $limit: limit },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'donor'
            }
        },
        { $unwind: '$donor' },
        {
            $project: {
                _id: 0,
                donor: {
                    _id: '$donor._id',
                    firstName: '$donor.firstName',
                    lastName: '$donor.lastName',
                    profileImage: '$donor.profileImage'
                },
                totalAmount: 1,
                totalUsdAmount: 1,
                donationCount: 1,
                lastDonation: 1
            }
        }
    ]);
};

const Donation = mongoose.model('Donation', donationSchema);
export default Donation;
