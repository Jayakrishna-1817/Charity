import express from 'express';
import Project from '../models/Project.js';
import Charity from '../models/Charity.js';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';


const router = express.Router();

/**
 * @route   GET /api/projects
 * @desc    Get all projects
 * @access  Public
 */
router.get('/', optionalAuth, async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 12, 
            category, 
            status = 'active', 
            search, 
            country,
            featured,
            urgency 
        } = req.query;
        
        const query = {};
        
        // Only show active projects to public, all to admin
        if (req.user?.role !== 'admin') {
            query.status = 'active';
        } else if (status) {
            query.status = status;
        }
        
        if (category) query.category = category;
        if (country) query['location.country'] = country;
        if (featured) query.featured = featured === 'true';
        if (urgency) query.urgency = urgency;
        
        if (search) {
            query.$text = { $search: search };
        }

        const projects = await Project.find(query)
            .populate('charity', 'name logo walletAddress')
            .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
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
        console.error('Get projects error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

/**
 * @route   POST /api/projects
 * @desc    Create a new project
 * @access  Private (Charity)
 */
router.post('/', authenticate, async (req, res) => {
    try {
        const {
            title,
            description,
            shortDescription,
            category,
            charity,
            targetAmount,
            deadline,
            milestones,
            images,
            location,
            tags
        } = req.body;

        // Validation
        if (!title || !description || !shortDescription || !category || !charity || !targetAmount || !deadline) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check if user owns the charity
        const charityDoc = await Charity.findById(charity);
        if (!charityDoc) {
            return res.status(404).json({
                success: false,
                message: 'Charity not found'
            });
        }

        if (req.user.role !== 'admin' && charityDoc.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied: You do not own this charity'
            });
        }

        const project = new Project({
            title,
            description,
            shortDescription,
            category,
            charity,
            targetAmount,
            deadline: new Date(deadline),
            milestones: milestones || [],
            images: images || [],
            location: location || {},
            tags: tags || [],
            status: 'draft'
        });

        await project.save();
        await project.populate('charity', 'name logo walletAddress');

        res.status(201).json({
            success: true,
            message: 'Project created successfully',
            data: {
                project
            }
        });

    } catch (error) {
        console.error('Create project error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during project creation'
        });
    }
});

/**
 * @route   GET /api/projects/:id
 * @desc    Get project by ID
 * @access  Public
 */
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;

        const project = await Project.findById(id)
            .populate('charity', 'name logo walletAddress description website');
        
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Only show active projects to public, all to admin/charity owner
        if (project.status !== 'active' && 
            req.user?.role !== 'admin' && 
            req.user?._id.toString() !== project.charity.owner?.toString()) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Increment view count
        await Project.findByIdAndUpdate(id, { $inc: { 'stats.viewCount': 1 } });

        res.json({
            success: true,
            data: {
                project
            }
        });

    } catch (error) {
        console.error('Get project error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

/**
 * @route   PUT /api/projects/:id
 * @desc    Update project
 * @access  Private (Charity Owner or Admin)
 */
router.put('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        
        const project = await Project.findById(id).populate('charity');
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Check ownership or admin role
        if (req.user.role !== 'admin' && project.charity.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const updateData = req.body;
        delete updateData.charity; // Prevent charity change
        delete updateData.raisedAmount; // Prevent manual raised amount change
        delete updateData.releasedAmount; // Prevent manual released amount change

        const updatedProject = await Project.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('charity', 'name logo walletAddress');

        res.json({
            success: true,
            message: 'Project updated successfully',
            data: {
                project: updatedProject
            }
        });

    } catch (error) {
        console.error('Update project error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

export default router; 

