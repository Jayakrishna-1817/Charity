import express from 'express';
import Donation from '../models/Donation.js';
import Project from '../models/Project.js';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';


const router = express.Router();

/**
 * @route   GET /api/donations
 * @desc    Get all donations
 * @access  Private (Admin)
 */
router.get('/', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { page = 1, limit = 20, status, project, charity } = req.query;
        
        const query = {};
        if (status) query.status = status;
        if (project) query.project = project;
        if (charity) query.charity = charity;

        const donations = await Donation.find(query)
            .populate('donor', 'firstName lastName email')
            .populate('project', 'title shortDescription')
            .populate('charity', 'name logo')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Donation.countDocuments(query);

        res.json({
            success: true,
            data: {
                donations,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });

    } catch (error) {
        console.error('Get donations error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

/**
 * @route   POST /api/donations
 * @desc    Create a new donation record
 * @access  Private
 */
router.post('/', authenticate, async (req, res) => {
    try {
        const {
            project,
            amount,
            currency,
            message,
            isAnonymous,
            transactionHash,
            donorWalletAddress,
            recipientWalletAddress
        } = req.body;

        // Validation
        if (!project || !amount || !donorWalletAddress || !recipientWalletAddress) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Get project and charity info
        const projectDoc = await Project.findById(project).populate('charity');
        if (!projectDoc) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        const donation = new Donation({
            donor: req.user._id,
            project,
            charity: projectDoc.charity._id,
            amount,
            currency: currency || 'ETH',
            message: message || '',
            isAnonymous: isAnonymous || false,
            transactionHash,
            donorWalletAddress,
            recipientWalletAddress,
            status: 'pending'
        });

        await donation.save();
        await donation.populate([
            { path: 'project', select: 'title shortDescription' },
            { path: 'charity', select: 'name logo' }
        ]);

        res.status(201).json({
            success: true,
            message: 'Donation recorded successfully',
            data: {
                donation
            }
        });

    } catch (error) {
        console.error('Create donation error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during donation creation'
        });
    }
});

/**
 * @route   GET /api/donations/:id
 * @desc    Get donation by ID
 * @access  Private
 */
router.get('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        const donation = await Donation.findById(id)
            .populate('donor', 'firstName lastName email')
            .populate('project', 'title shortDescription targetAmount')
            .populate('charity', 'name logo');
        
        if (!donation) {
            return res.status(404).json({
                success: false,
                message: 'Donation not found'
            });
        }

        // Check access permissions
        if (req.user.role !== 'admin' && 
            donation.donor._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.json({
            success: true,
            data: {
                donation
            }
        });

    } catch (error) {
        console.error('Get donation error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

/**
 * @route   PUT /api/donations/:id/status
 * @desc    Update donation status
 * @access  Private (Admin or Blockchain service)
 */
router.put('/:id/status', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, transactionHash, blockNumber, gasUsed, gasFee } = req.body;

        if (!['pending', 'confirmed', 'failed', 'refunded'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const updateData = { status };
        if (transactionHash) updateData.transactionHash = transactionHash;
        if (blockNumber) updateData.blockNumber = blockNumber;
        if (gasUsed) updateData.gasUsed = gasUsed;
        if (gasFee) updateData.gasFee = gasFee;

        const donation = await Donation.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate([
            { path: 'project', select: 'title shortDescription' },
            { path: 'charity', select: 'name logo' }
        ]);

        if (!donation) {
            return res.status(404).json({
                success: false,
                message: 'Donation not found'
            });
        }

        // If confirmed, update project raised amount
        if (status === 'confirmed') {
            await Project.findByIdAndUpdate(
                donation.project._id,
                { 
                    $inc: { 
                        raisedAmount: donation.amount,
                        'stats.donorCount': 1
                    }
                }
            );
        }

        res.json({
            success: true,
            message: 'Donation status updated successfully',
            data: {
                donation
            }
        });

    } catch (error) {
        console.error('Update donation status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

/**
 * @route   GET /api/donations/stats/overview
 * @desc    Get donation statistics
 * @access  Private (Admin)
 */
router.get('/stats/overview', authenticate, authorize('admin'), async (req, res) => {
    try {
        const stats = await Donation.getStatistics();
        const topDonors = await Donation.getTopDonors(10);

        const donationsByMonth = await Donation.aggregate([
            { $match: { status: 'confirmed' } },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 12 }
        ]);

        res.json({
            success: true,
            data: {
                overview: stats,
                topDonors,
                donationsByMonth
            }
        });

    } catch (error) {
        console.error('Get donation stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

export default router; 

