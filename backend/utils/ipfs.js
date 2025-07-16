import { create } from 'ipfs-http-client';
import fs from 'fs';
import path from 'path';

class IPFSService {
    constructor() {
        this.ipfs = create({
            host: 'localhost',
            port: 5001,
            protocol: 'http'
        });

        this.mockMode = false;
        this.mockStorage = new Map();
    }

    async initialize() {
        try {
            await this.ipfs.id();
            console.log('IPFS node connected successfully');
            return true;
        } catch (error) {
            console.warn('IPFS node not available, using mock mode:', error.message);
            this.mockMode = true;
            return false;
        }
    }

    async uploadFile(content, filename) {
        try {
            if (this.mockMode) return this._mockUpload(content, filename);

            const result = await this.ipfs.add({ path: filename, content });
            return {
                hash: result.cid.toString(),
                filename,
                size: result.size,
                uploadedAt: new Date().toISOString(),
                type: this._getFileType(filename)
            };
        } catch (error) {
            console.error('IPFS upload error:', error);
            throw new Error('Failed to upload file to IPFS');
        }
    }

    async uploadMultipleFiles(files) {
        const results = [];
        for (const file of files) {
            const result = await this.uploadFile(file.content, file.filename);
            results.push(result);
        }
        return results;
    }

    async getFile(hash) {
        try {
            if (this.mockMode) return this._mockRetrieve(hash);

            const chunks = [];
            for await (const chunk of this.ipfs.cat(hash)) {
                chunks.push(chunk);
            }

            return Buffer.concat(chunks);
        } catch (error) {
            console.error('IPFS retrieval error:', error);
            throw new Error('Failed to retrieve file from IPFS');
        }
    }

    async getFileMetadata(hash) {
        try {
            if (this.mockMode) return this._mockGetMetadata(hash);

            const stat = await this.ipfs.files.stat(`/ipfs/${hash}`);
            return {
                hash,
                size: stat.size,
                type: stat.type,
                retrievedAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('IPFS metadata error:', error);
            throw new Error('Failed to get file metadata from IPFS');
        }
    }

    async pinFile(hash) {
        try {
            if (this.mockMode) return true;
            await this.ipfs.pin.add(hash);
            return true;
        } catch (error) {
            console.error('IPFS pin error:', error);
            return false;
        }
    }

    async unpinFile(hash) {
        try {
            if (this.mockMode) return true;
            await this.ipfs.pin.rm(hash);
            return true;
        } catch (error) {
            console.error('IPFS unpin error:', error);
            return false;
        }
    }

    getPublicUrl(hash) {
        return `https://ipfs.io/ipfs/${hash}`;
    }

    isValidHash(hash) {
        const cidRegex = /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|b[A-Za-z2-7]{58}|B[A-Z2-7]{58}|z[1-9A-HJ-NP-Za-km-z]{48}|F[0-9A-F]{50})$/;
        return cidRegex.test(hash);
    }

    _getFileType(filename) {
        const ext = path.extname(filename).toLowerCase();
        const typeMap = {
            '.pdf': 'document', '.doc': 'document', '.docx': 'document',
            '.txt': 'document', '.jpg': 'image', '.jpeg': 'image',
            '.png': 'image', '.gif': 'image', '.mp4': 'video',
            '.avi': 'video', '.mov': 'video'
        };
        return typeMap[ext] || 'unknown';
    }

    _mockUpload(content, filename) {
        const hash = 'Qm' + Math.random().toString(36).substr(2, 44);
        const metadata = {
            hash, filename,
            size: Buffer.isBuffer(content) ? content.length : content.length,
            uploadedAt: new Date().toISOString(),
            type: this._getFileType(filename)
        };
        this.mockStorage.set(hash, { content, metadata });
        return metadata;
    }

    _mockRetrieve(hash) {
        const stored = this.mockStorage.get(hash);
        if (!stored) throw new Error('File not found in mock storage');
        return Buffer.isBuffer(stored.content) ? stored.content : Buffer.from(stored.content);
    }

    _mockGetMetadata(hash) {
        const stored = this.mockStorage.get(hash);
        if (!stored) throw new Error('File not found in mock storage');
        return { ...stored.metadata, retrievedAt: new Date().toISOString() };
    }
}

export default IPFSService;
