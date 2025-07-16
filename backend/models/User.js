import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    }
    // role: {
    //     type: String,
    //     enum: ['donor', 'charity', 'auditor', 'admin'],
    //     default: 'donor'
    // },
    // walletAddress: {
    //     type: String,
    //     sparse: true,
    //     unique: true
    // },
    // profileImage: {
    //     type: String,
    //     default: null
    // },
    // isVerified: {
    //     type: Boolean,
    //     default: false
    // },
    // verificationToken: {
    //     type: String,
    //     default: null
    // },
    // resetPasswordToken: {
    //     type: String,
    //     default: null
    // },
    // resetPasswordExpires: {
    //     type: Date,
    //     default: null
    // },
    // lastLogin: {
    //     type: Date,
    //     default: null
    // },
    // isActive: {
    //     type: Boolean,
    //     default: true
    // },
    // preferences: {
    //     notifications: {
    //         email: { type: Boolean, default: true },
    //         browser: { type: Boolean, default: true }
    //     },
    //     privacy: {
    //         showDonations: { type: Boolean, default: false },
    //         showProfile: { type: Boolean, default: true }
    //     }
    // },
    // totalDonated: {
    //     type: Number,
    //     default: 0
    // },
    // donationCount: {
    //     type: Number,
    //     default: 0
    // }
}, {
    timestamps: true
});

userSchema.index({ email: 1 });
userSchema.index({ walletAddress: 1 });
userSchema.index({ role: 1 });

// Password hashing
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Virtual: full name
userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Clean output
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    delete user.verificationToken;
    delete user.resetPasswordToken;
    delete user.resetPasswordExpires;
    return user;
};

const User = mongoose.model('User', userSchema);

export default User;
