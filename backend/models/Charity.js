import mongoose from 'mongoose';

const charitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    website: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    address: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String
    },
    category: {
        type: String,
        enum: [
            'education', 'healthcare', 'environment', 'poverty', 'disaster-relief',
            'animal-welfare', 'human-rights', 'arts-culture', 'community-development', 'other'
        ],
        required: true
    },
    registrationNumber: {
        type: String,
        required: true,
        unique: true
    },
    taxId: {
        type: String,
        required: true
    },
    foundedYear: {
        type: Number,
        min: 1800,
        max: new Date().getFullYear()
    },
    logo: {
        type: String,
        default: null
    },
    images: [{
        url: String,
        caption: String
    }],
    documents: [{
        name: String,
        url: String,
        ipfsHash: String,
        type: {
            type: String,
            enum: ['registration', 'tax-exempt', 'financial-report', 'other']
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    walletAddress: {
        type: String,
        required: true,
        unique: true
    },
    blockchainId: {
        type: Number,
        unique: true,
        sparse: true
    },
    status: {
        type: String,
        enum: ['pending', 'verified', 'rejected', 'suspended'],
        default: 'pending'
    },
    verificationDate: {
        type: Date,
        default: null
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    rejectionReason: {
        type: String,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    stats: {
        totalReceived: { type: Number, default: 0 },
        totalProjects: { type: Number, default: 0 },
        completedProjects: { type: Number, default: 0 },
        totalDonors: { type: Number, default: 0 }
    },
    socialMedia: {
        facebook: String,
        twitter: String,
        instagram: String,
        linkedin: String
    },
    bankDetails: {
        accountName: String,
        accountNumber: String,
        bankName: String,
        routingNumber: String,
        swiftCode: String
    }
}, {
    timestamps: true
});

// Indexes
charitySchema.index({ name: 'text', description: 'text' });
charitySchema.index({ category: 1 });
charitySchema.index({ status: 1 });
charitySchema.index({ walletAddress: 1 });
charitySchema.index({ registrationNumber: 1 });

// Virtual population
charitySchema.virtual('projects', {
    ref: 'Project',
    localField: '_id',
    foreignField: 'charity'
});

// Remove sensitive data
charitySchema.methods.toJSON = function () {
    const charity = this.toObject();
    if (charity.bankDetails) {
        delete charity.bankDetails.accountNumber;
        delete charity.bankDetails.routingNumber;
    }
    return charity;
};

// ✅ Correct ESM export
const Charity = mongoose.model('Charity', charitySchema);
export default Charity;
