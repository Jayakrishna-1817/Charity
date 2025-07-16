import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { authenticate, authorize } from '../middleware/auth.js';
import IPFSService from '../utils/ipfs.js';



const router = express.Router();
const ipfsService = new IPFSService();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

ipfsService.initialize().then(connected => {
    console.log(connected ? 'IPFS service initialized successfully' : 'IPFS service running in mock mode');
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/documents/'),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|doc|docx|jpg|jpeg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        cb(mimetype && extname ? null : new Error('Only PDF, DOC, DOCX, JPG, JPEG, PNG files are allowed'));
    }
});

const documents = new Map();

router.post('/upload', authenticate, upload.single('document'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

        const { type, description, charityId, projectId } = req.body;
        const fileContent = fs.readFileSync(req.file.path);
        const ipfsResult = await ipfsService.uploadFile(fileContent, req.file.originalname);
        await ipfsService.pinFile(ipfsResult.hash);

        const documentId = Date.now().toString();
        const documentData = {
            id: documentId,
            ipfsHash: ipfsResult.hash,
            filename: req.file.originalname,
            localPath: req.file.path,
            size: req.file.size,
            mimetype: req.file.mimetype,
            type: type || 'other',
            description: description || '',
            charityId: charityId || null,
            projectId: projectId || null,
            uploadedBy: req.user._id,
            uploadedAt: new Date(),
            publicUrl: ipfsService.getPublicUrl(ipfsResult.hash),
            verified: false
        };

        documents.set(documentId, documentData);
        try { fs.unlinkSync(req.file.path); } catch (err) { console.warn('Cleanup failed:', err.message); }

        res.json({ success: true, message: 'Document uploaded to IPFS successfully', data: { document: documentData } });

    } catch (error) {
        console.error('Upload document error:', error);
        if (req.file && req.file.path) {
            try { fs.unlinkSync(req.file.path); } catch (err) { console.warn('Cleanup failed:', err.message); }
        }
        res.status(500).json({ success: false, message: 'Server error during document upload' });
    }
});

router.get('/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const document = documents.get(id);
    if (!document) return res.status(404).json({ success: false, message: 'Document not found' });

    if (req.user.role !== 'admin' && document.uploadedBy.toString() !== req.user._id.toString())
        return res.status(403).json({ success: false, message: 'Access denied' });

    res.json({ success: true, data: { document } });
});

router.get('/:id/download', authenticate, async (req, res) => {
    const { id } = req.params;
    const document = documents.get(id);
    if (!document) return res.status(404).json({ success: false, message: 'Document not found' });

    if (req.user.role !== 'admin' && document.uploadedBy.toString() !== req.user._id.toString())
        return res.status(403).json({ success: false, message: 'Access denied' });

    const fileContent = await ipfsService.getFile(document.ipfsHash);
    res.setHeader('Content-Type', document.mimetype);
    res.setHeader('Content-Disposition', `attachment; filename="${document.filename}"`);
    res.setHeader('Content-Length', fileContent.length);
    res.send(fileContent);
});

router.post('/:id/verify', authenticate, authorize('admin', 'auditor'), async (req, res) => {
    const { id } = req.params;
    const { verified, verificationNotes } = req.body;
    const document = documents.get(id);
    if (!document) return res.status(404).json({ success: false, message: 'Document not found' });

    document.verified = verified;
    document.verificationNotes = verificationNotes || '';
    document.verifiedBy = req.user._id;
    document.verifiedAt = new Date();

    documents.set(id, document);
    res.json({ success: true, message: 'Document verification updated successfully', data: { document } });
});

router.delete('/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const document = documents.get(id);
    if (!document) return res.status(404).json({ success: false, message: 'Document not found' });

    if (req.user.role !== 'admin' && document.uploadedBy.toString() !== req.user._id.toString())
        return res.status(403).json({ success: false, message: 'Access denied' });

    await ipfsService.unpinFile(document.ipfsHash);
    documents.delete(id);
    res.json({ success: true, message: 'Document deleted successfully' });
});

router.get('/', authenticate, async (req, res) => {
    const { charityId, projectId, type, verified } = req.query;
    let filteredDocuments = Array.from(documents.values());

    if (charityId) filteredDocuments = filteredDocuments.filter(doc => doc.charityId === charityId);
    if (projectId) filteredDocuments = filteredDocuments.filter(doc => doc.projectId === projectId);
    if (type) filteredDocuments = filteredDocuments.filter(doc => doc.type === type);
    if (verified !== undefined) filteredDocuments = filteredDocuments.filter(doc => doc.verified === (verified === 'true'));

    if (req.user.role !== 'admin') {
        filteredDocuments = filteredDocuments.filter(doc => doc.uploadedBy.toString() === req.user._id.toString());
    }

    res.json({ success: true, data: { documents: filteredDocuments, total: filteredDocuments.length } });
});

// donations.js
export default router;

