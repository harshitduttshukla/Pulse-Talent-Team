import Video from '../models/Video';
import { getIO } from '../socket';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import ffmpegStatic from 'ffmpeg-static';

// Set ffmpeg path explicitly
if (ffmpegStatic) {
    ffmpeg.setFfmpegPath(ffmpegStatic);
}

export const processVideo = async (videoId: string) => {
    try {
        const video = await Video.findById(videoId);
        if (!video) return;

        // Update status to processing
        video.status = 'processing';
        await video.save();

        const io = getIO();
        io.emit('videoStatusUpdate', { videoId, status: 'processing', progress: 0 });

        const inputPath = path.join('uploads', video.filename);
        const thumbnailFilename = `thumb-${video._id}.png`;
        const thumbnailPath = path.join('uploads', 'thumbnails');

        // Generate thumbnail
        ffmpeg(inputPath)
            .screenshots({
                timestamps: ['1'], // Screenshot at 1 second
                filename: thumbnailFilename,
                folder: thumbnailPath,
                size: '320x240'
            })
            .on('end', async () => {
                console.log('Thumbnail generated');
                video.thumbnail = `thumbnails/${thumbnailFilename}`;
                await video.save();
            })
            .on('error', (err) => {
                console.error('Error generating thumbnail:', err);
            });

        // Simulate progress updates for processing
        let progress = 0;
        const interval = setInterval(async () => {
            progress += 10;
            io.emit('videoStatusUpdate', { videoId, status: 'processing', progress });

            if (progress >= 100) {
                clearInterval(interval);

                // Random sensitivity result
                const isSafe = Math.random() > 0.3; // 70% safe
                video.status = 'completed';
                video.sensitivityStatus = isSafe ? 'safe' : 'flagged';
                await video.save();

                io.emit('videoStatusUpdate', {
                    videoId,
                    status: 'completed',
                    sensitivityStatus: video.sensitivityStatus,
                    progress: 100
                });
            }
        }, 1000); // 10 seconds total

    } catch (error) {
        console.error(`Processing error for video ${videoId}:`, error);
        try {
            const video = await Video.findById(videoId);
            if (video) {
                video.status = 'failed';
                await video.save();
                getIO().emit('videoStatusUpdate', { videoId, status: 'failed', progress: 0 });
            }
        } catch (e) { console.error(e); }
    }
};
