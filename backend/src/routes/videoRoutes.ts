import express from 'express';
import { uploadVideo, getVideos, getVideoById, streamVideo, deleteVideo } from '../controllers/videoController';
import { protect, authorize } from '../middleware/authMiddleware';
import upload from '../middleware/uploadMiddleware';
import { cacheMiddleware } from '../middleware/cacheMiddleware';
import { check, param } from 'express-validator';
import { validateResult } from '../middleware/validationMiddleware';

const router = express.Router();

router.route('/')
    .get(protect, cacheMiddleware, getVideos) // caching applied
    .post(protect, authorize('editor', 'admin'), upload.single('video'), [
        check('title', 'Title is required').not().isEmpty()
    ], validateResult, uploadVideo);

router.route('/:id')
    .get([
        param('id', 'Invalid Video ID').isMongoId()
    ], validateResult, getVideoById)
    .delete(protect, [
        param('id', 'Invalid Video ID').isMongoId()
    ], validateResult, deleteVideo);

router.route('/:id/stream')
    .get([
        param('id', 'Invalid Video ID').isMongoId()
    ], validateResult, streamVideo);

export default router;
