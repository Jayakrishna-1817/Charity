import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';
import { generateTokensForUser } from '../utils/jwt.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName, role, walletAddress } = req.body;

        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User with this email already exists' });
        }

        if (walletAddress) {
            const existingWallet = await User.findOne({ walletAddress });
            if (existingWallet) {
                return res.status(400).json({ success: false, message: 'Wallet address already registered' });
            }
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');

        const user = new User({
            email: email.toLowerCase(),
            password,
            firstName,
            lastName,
            role: role || 'donor',
            walletAddress,
            verificationToken,
            isVerified: false
        });

        await user.save();

        const tokens = generateTokensForUser(user);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: user.toJSON(),
                tokens
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'Server error during registration' });
    }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password, walletAddress } = req.body;

        let user;
        if (email) {
            user = await User.findOne({ email: email.toLowerCase() });
        } else if (walletAddress) {
            user = await User.findOne({ walletAddress });
        } else {
            return res.status(400).json({ success: false, message: 'Please provide email or wallet address' });
        }

        if (!user || !user.isActive) {
            return res.status(401).json({ success: false, message: 'Invalid credentials or account deactivated' });
        }

        if (email && password) {
            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }
        }

        user.lastLogin = new Date();
        await user.save();

        const tokens = generateTokensForUser(user);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: user.toJSON(),
                tokens
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
});

/**
 * @route   POST /api/auth/wallet-login
 * @desc    Login with wallet
 * @access  Public
 */
router.post('/wallet-login', async (req, res) => {
    try {
        const { walletAddress, signature, message } = req.body;

        if (!walletAddress || !signature || !message) {
            return res.status(400).json({ success: false, message: 'Wallet address, signature, and message are required' });
        }

        let user = await User.findOne({ walletAddress });

        if (!user) {
            user = new User({
                email: `${walletAddress}@wallet.local`,
                password: crypto.randomBytes(32).toString('hex'),
                firstName: 'Wallet',
                lastName: 'User',
                walletAddress,
                isVerified: true
            });
            await user.save();
        }

        if (!user.isActive) {
            return res.status(401).json({ success: false, message: 'Account is deactivated' });
        }

        user.lastLogin = new Date();
        await user.save();

        const tokens = generateTokensForUser(user);

        res.json({
            success: true,
            message: 'Wallet login successful',
            data: {
                user: user.toJSON(),
                tokens
            }
        });

    } catch (error) {
        console.error('Wallet login error:', error);
        res.status(500).json({ success: false, message: 'Server error during wallet login' });
    }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, async (req, res) => {
    try {
        res.json({
            success: true,
            data: { user: req.user.toJSON() }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authenticate, async (req, res) => {
    try {
        const { firstName, lastName, profileImage, preferences } = req.body;

        const updateData = {};
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (profileImage) updateData.profileImage = profileImage;
        if (preferences) updateData.preferences = { ...req.user.preferences, ...preferences };

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: { user: user.toJSON() }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, message: 'Server error during profile update' });
    }
});

/**
 * @route   POST /api/auth/change-password
 * @desc    Change password
 * @access  Private
 */
router.post('/change-password', authenticate, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword || newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'Invalid password data' });
        }

        const user = await User.findById(req.user._id);
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);

        if (!isCurrentPasswordValid) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ success: true, message: 'Password changed successfully' });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ success: false, message: 'Server error during password change' });
    }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authenticate, async (req, res) => {
    try {
        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ success: false, message: 'Server error during logout' });
    }
});

export default router;
