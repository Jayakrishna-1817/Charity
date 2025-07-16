import express from 'express';
import Charity from '../models/Charity.js';
import Project from '../models/Project.js';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';


const router = express.Router();

/**
 * @route   GET /api/charities
 * @desc    Get all charities
 * @access  Public
 */
router.get('/', optionalAuth, async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 12, 
            category, 
            status = 'verified', 
            search, 
            country,
            featured 
        } = req.query;
        
        const query = { isActive: true };
        
        // Only show verified charities to public, all to admin
        if (req.user?.role !== 'admin') {
            query.status = 'verified';
        } else if (status) {
            query.status = status;
        }
        
        if (category) query.category = category;
        if (country) query['address.country'] = country;
        if (featured) query.featured = featured === 'true';
        
        if (search) {
            query.$text = { $search: search };
        }

        const charities = await Charity.find(query)
            .populate('owner', 'firstName lastName email')
            .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Charity.countDocuments(query);

        res.json({
            success: true,
            data: {
                charities,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });

    } catch (error) {
        console.error('Get charities error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

/**
 * @route   POST /api/charities
 * @desc    Register a new charity
 * @access  Private
 */
router.post('/', authenticate, async (req, res) => {
    try {
        const {
            name,
            description,
            website,
            email,
            phone,
            address,
            category,
            registrationNumber,
            taxId,
            foundedYear,
            walletAddress
        } = req.body;

        // Validation
        if (!name || !description || !email || !category || !registrationNumber || !taxId || !walletAddress) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check if charity with same registration number exists
        const existingCharity = await Charity.findOne({ registrationNumber });
        if (existingCharity) {
            return res.status(400).json({
                success: false,
                message: 'Charity with this registration number already exists'
            });
        }

        // Check if wallet address is already used
        const existingWallet = await Charity.findOne({ walletAddress });
        if (existingWallet) {
            return res.status(400).json({
                success: false,
                message: 'Wallet address already registered'
            });
        }

        const charity = new Charity({
            name,
            description,
            website,
            email,
            phone,
            address,
            category,
            registrationNumber,
            taxId,
            foundedYear,
            walletAddress,
            owner: req.user._id,
            status: 'pending'
        });

        await charity.save();

        // Populate owner information
        await charity.populate('owner', 'firstName lastName email');

        res.status(201).json({
            success: true,
            message: 'Charity registered successfully. Awaiting verification.',
            data: {
                charity
            }
        });

    } catch (error) {
        console.error('Register charity error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during charity registration'
        });
    }
});

/**
 * @route   GET /api/charities/:id
 * @desc    Get charity by ID
 * @access  Public
 */
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;

        const charity = await Charity.findById(id)
            .populate('owner', 'firstName lastName email');
        
        if (!charity) {
            return res.status(404).json({
                success: false,
                message: 'Charity not found'
            });
        }

        // Only show verified charities to public, all to admin/owner
        if (charity.status !== 'verified' && 
            req.user?.role !== 'admin' && 
            req.user?._id.toString() !== charity.owner._id.toString()) {
            return res.status(404).json({
                success: false,
                message: 'Charity not found'
            });
        }

        // Get charity's projects
        const projects = await Project.find({ 
            charity: id, 
            status: { $in: ['active', 'completed'] } 
        })
        .select('title shortDescription targetAmount raisedAmount status deadline images')
        .sort({ createdAt: -1 })
        .limit(6);

        res.json({
            success: true,
            data: {
                charity,
                projects
            }
        });

    } catch (error) {
        console.error('Get charity error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

/**
 * @route   PUT /api/charities/:id
 * @desc    Update charity
 * @access  Private (Owner or Admin)
 */
router.put('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        
        const charity = await Charity.findById(id);
        if (!charity) {
            return res.status(404).json({
                success: false,
                message: 'Charity not found'
            });
        }

        // Check ownership or admin role
        if (req.user.role !== 'admin' && charity.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const {
            name,
            description,
            website,
            phone,
            address,
            logo,
            images,
            socialMedia,
            bankDetails
        } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (description) updateData.description = description;
        if (website) updateData.website = website;
        if (phone) updateData.phone = phone;
        if (address) updateData.address = address;
        if (logo) updateData.logo = logo;
        if (images) updateData.images = images;
        if (socialMedia) updateData.socialMedia = socialMedia;
        if (bankDetails) updateData.bankDetails = bankDetails;

        const updatedCharity = await Charity.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('owner', 'firstName lastName email');

        res.json({
            success: true,
            message: 'Charity updated successfully',
            data: {
                charity: updatedCharity
            }
        });

    } catch (error) {
        console.error('Update charity error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

/**
 * @route   PUT /api/charities/:id/verify
 * @desc    Verify or reject charity
 * @access  Private (Admin or Auditor)
 */
router.put('/:id/verify', authenticate, authorize('admin', 'auditor'), async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejectionReason } = req.body;

        if (!['verified', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status must be either verified or rejected'
            });
        }

        if (status === 'rejected' && !rejectionReason) {
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required'
            });
        }

        const updateData = {
            status,
            verificationDate: new Date(),
            verifiedBy: req.user._id
        };

        if (status === 'rejected') {
            updateData.rejectionReason = rejectionReason;
        }

        const charity = await Charity.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('owner', 'firstName lastName email')
         .populate('verifiedBy', 'firstName lastName email');

        if (!charity) {
            return res.status(404).json({
                success: false,
                message: 'Charity not found'
            });
        }

        res.json({
            success: true,
            message: `Charity ${status} successfully`,
            data: {
                charity
            }
        });

    } catch (error) {
        console.error('Verify charity error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

/**
 * @route   GET /api/charities/:id/projects
 * @desc    Get charity's projects
 * @access  Public
 */
router.get('/:id/projects', optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 10, status } = req.query;

        const charity = await Charity.findById(id);
        if (!charity) {
            return res.status(404).json({
                success: false,
                message: 'Charity not found'
            });
        }

        const query = { charity: id };
        
        // Only show active/completed projects to public
        if (req.user?.role !== 'admin' && charity.owner.toString() !== req.user?._id.toString()) {
            query.status = { $in: ['active', 'completed'] };
        } else if (status) {
            query.status = status;
        }

        const projects = await Project.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Project.countDocuments(query);

        res.json({
            success: true,
            data: {
                projects,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });

    } catch (error) {
        console.error('Get charity projects error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

/**
 * @route   GET /api/charities/stats/overview
 * @desc    Get charity statistics
 * @access  Private (Admin)
 */
router.get('/stats/overview', authenticate, authorize('admin'), async (req, res) => {
    try {
        const totalCharities = await Charity.countDocuments();
        const verifiedCharities = await Charity.countDocuments({ status: 'verified' });
        const pendingCharities = await Charity.countDocuments({ status: 'pending' });
        
        const charitiesByCategory = await Charity.aggregate([
            { $match: { status: 'verified' } },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            }
        ]);

        const topCharities = await Charity.find({ status: 'verified' })
            .sort({ 'stats.totalReceived': -1 })
            .limit(10)
            .select('name stats.totalReceived stats.totalProjects');

        res.json({
            success: true,
            data: {
                overview: {
                    totalCharities,
                    verifiedCharities,
                    pendingCharities,
                    rejectedCharities: totalCharities - verifiedCharities - pendingCharities
                },
                charitiesByCategory: charitiesByCategory.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
                topCharities
            }
        });

    } catch (error) {
        console.error('Get charity stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

export default router;


