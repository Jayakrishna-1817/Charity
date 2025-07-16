import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    targetAmount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'submitted', 'approved', 'rejected'],
        default: 'pending'
    },
    documents: [{
        name: String,
        url: String,
        ipfsHash: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    submittedAt: {
        type: Date,
        default: null
    },
    reviewedAt: {
        type: Date,
        default: null
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    reviewNotes: {
        type: String,
        default: null
    }
});

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    shortDescription: {
        type: String,
        required: true,
        maxlength: 200
    },
    category: {
        type: String,
        enum: [
            'education',
            'healthcare',
            'environment',
            'poverty',
            'disaster-relief',
            'animal-welfare',
            'human-rights',
            'arts-culture',
            'community-development',
            'other'
        ],
        required: true
    },
    charity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Charity',
        required: true
    },
    targetAmount: {
        type: Number,
        required: true,
        min: 0
    },
    raisedAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    releasedAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    deadline: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'active', 'completed', 'cancelled', 'suspended'],
        default: 'draft'
    },
    images: [{
        url: String,
        caption: String,
        isPrimary: {
            type: Boolean,
            default: false
        }
    }],
    location: {
        country: String,
        state: String,
        city: String,
        coordinates: {
            latitude: Number,
            longitude: Number
        }
    },
    milestones: [milestoneSchema],
    blockchainId: {
        type: Number,
        unique: true,
        sparse: true
    },
    tags: [String],
    featured: {
        type: Boolean,
        default: false
    },
    urgency: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    stats: {
        viewCount: {
            type: Number,
            default: 0
        },
        donorCount: {
            type: Number,
            default: 0
        },
        shareCount: {
            type: Number,
            default: 0
        }
    },
    updates: [{
        title: String,
        content: String,
        images: [String],
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    faqs: [{
        question: String,
        answer: String
    }]
}, {
    timestamps: true
});

// Indexes for better query performance
projectSchema.index({ title: 'text', description: 'text', shortDescription: 'text' });
projectSchema.index({ charity: 1 });
projectSchema.index({ category: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ deadline: 1 });
projectSchema.index({ featured: 1 });
projectSchema.index({ 'location.country': 1 });

// Virtual for donations
projectSchema.virtual('donations', {
    ref: 'Donation',
    localField: '_id',
    foreignField: 'project'
});

// Calculate progress percentage
projectSchema.virtual('progressPercentage').get(function() {
    if (this.targetAmount === 0) return 0;
    return Math.min((this.raisedAmount / this.targetAmount) * 100, 100);
});

// Calculate days remaining
projectSchema.virtual('daysRemaining').get(function() {
    const now = new Date();
    const deadline = new Date(this.deadline);
    const diffTime = deadline - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(diffDays, 0);
});

// Check if project is expired
projectSchema.virtual('isExpired').get(function() {
    return new Date() > new Date(this.deadline);
});

// Get primary image
projectSchema.virtual('primaryImage').get(function() {
    const primary = this.images.find(img => img.isPrimary);
    return primary ? primary.url : (this.images.length > 0 ? this.images[0].url : null);
});

// Pre-save middleware to validate milestones
projectSchema.pre('save', function(next) {
    if (this.milestones && this.milestones.length > 0) {
        const totalMilestoneAmount = this.milestones.reduce((sum, milestone) => sum + milestone.targetAmount, 0);
        if (Math.abs(totalMilestoneAmount - this.targetAmount) > 0.01) {
            return next(new Error('Total milestone amounts must equal target amount'));
        }
    }
    next();
});

// module.exports = mongoose.model('Project', projectSchema);
export default projectSchema;
