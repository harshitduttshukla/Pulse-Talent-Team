import React, { useRef, useEffect } from 'react';

interface VideoPlayerProps {
    videoId: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current) {
            // Load the video
            videoRef.current.load();
        }
    }, [videoId]);

    return (
        <div className="video-container bg-black rounded-lg overflow-hidden shadow-lg aspect-w-16 aspect-h-9">
            <video
                ref={videoRef}
                controls
                width="100%"
                height="auto"
                crossOrigin="anonymous"
            >
                <source src={`http://localhost:5000/api/videos/${videoId}/stream`} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        </div>
    );
};

export default VideoPlayer;
