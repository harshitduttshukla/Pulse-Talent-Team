import { Request, Response } from 'express';
import Video from '../models/Video';
import fs from 'fs';
import path from 'path';
import { processVideo } from '../services/processingService';
import { clearCache } from '../middleware/cacheMiddleware';

export const uploadVideo = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            res.status(400).json({ message: 'No file uploaded' });
            return;
        }

        const { title, description, category } = req.body;

        const video = await Video.create({
            title,
            description,
            filename: req.file.filename,
            originalName: req.file.originalname,
            uploader: req.user?._id,
            size: req.file.size,
            status: 'pending',
            sensitivityStatus: 'pending',
            category
        });

        // Trigger processing asynchronously
        processVideo(video._id.toString());

        // Clear cache so new video appears
        clearCache();

        res.status(201).json(video);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getVideos = async (req: Request, res: Response) => {
    try {
        const { status, sensitivity, category, startDate, endDate, minSize, maxSize, public: isPublic } = req.query;
        let query: any = {};

        if (status) query.status = status;
        if (sensitivity) query.sensitivityStatus = sensitivity;
        if (category) query.category = category;

        // Date Filtering
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate as string);
            if (endDate) query.createdAt.$lte = new Date(endDate as string);
        }

        // Size Filtering (in bytes)
        if (minSize || maxSize) {
            query.size = {};
            if (minSize) query.size.$gte = parseInt(minSize as string);
            if (maxSize) query.size.$lte = parseInt(maxSize as string);
        }

        // Public feed logic OR Admin rights OR User isolation
        if (isPublic === 'true') {
            // Public feed: Only completed and safe videos from ANYONE
            query.status = 'completed';
            query.sensitivityStatus = 'safe';
        } else if (req.user && req.user.role === 'admin') {
            // Admin sees all, respecting filters
        } else {
            // User isolation: only return videos uploaded by the current user
            query.uploader = req.user?._id;
        }

        const videos = await Video.find(query).populate('uploader', 'username');
        res.json(videos);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getVideoById = async (req: Request, res: Response) => {
    try {
        const video = await Video.findById(req.params.id).populate('uploader', 'username');
        if (video) {
            res.json(video);
        } else {
            res.status(404).json({ message: 'Video not found' });
        }
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const streamVideo = async (req: Request, res: Response) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) {
            res.status(404).json({ message: 'Video not found' });
            return;
        }

        const videoPath = path.join('uploads', video.filename);
        const stat = fs.statSync(videoPath);
        const fileSize = stat.size;
        const range = req.headers.range;

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;
            const file = fs.createReadStream(videoPath, { start, end });
            const head = {
                'Content-Range': `bytes ${start} -${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'video/mp4',
            };
            res.writeHead(206, head);
            file.pipe(res);
        } else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
            };
            res.writeHead(200, head);
            fs.createReadStream(videoPath).pipe(res);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error streaming video' });
    }
};


export const deleteVideo = async (req: Request, res: Response): Promise<void> => {
    try {
        const video = await Video.findById(req.params.id);

        if (!video) {
            res.status(404).json({ message: 'Video not found' });
            return;
        }

        // Check if user is uploader or admin
        if (video.uploader.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }

        // Delete file from filesystem
        const videoPath = path.join('uploads', video.filename);
        if (fs.existsSync(videoPath)) {
            fs.unlinkSync(videoPath);
        }

        await video.deleteOne();

        // Clear cache
        clearCache();

        res.json({ message: 'Video removed' });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};
