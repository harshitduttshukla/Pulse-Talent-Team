import { useEffect, useState } from 'react';
import api from '../api/axios';
import UploadVideo from '../components/UploadVideo';
import VideoPlayer from '../components/VideoPlayer';
import { getSocket } from '../socket';
import { Play, AlertOctagon, CheckCircle, Clock, Trash2 } from 'lucide-react';

interface Video {
    _id: string;
    title: string;
    description: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    sensitivityStatus: 'pending' | 'safe' | 'flagged';
    progress?: number;
    uploader: {
        username: string;
    };
    createdAt: string;
    size?: number; // Added size property
    thumbnail?: string;
}

const Dashboard = () => {
    const [videos, setVideos] = useState<Video[]>([]);
    const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [filterSensitivity, setFilterSensitivity] = useState<string>('');
    const [filterCategory, setFilterCategory] = useState<string>('');
    const [filterStartDate, setFilterStartDate] = useState<string>('');
    const [filterEndDate, setFilterEndDate] = useState<string>('');
    const [filterMinSize, setFilterMinSize] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('newest');

    const fetchVideos = async () => {
        try {
            const params = new URLSearchParams();
            if (filterStatus) params.append('status', filterStatus);
            if (filterSensitivity) params.append('sensitivity', filterSensitivity);
            if (filterCategory) params.append('category', filterCategory);
            if (filterStartDate) params.append('startDate', filterStartDate);
            if (filterEndDate) params.append('endDate', filterEndDate);
            if (filterMinSize) params.append('minSize', filterMinSize);

            const { data } = await api.get(`/videos?${params.toString()}`);
            if (Array.isArray(data)) {
                setVideos(data);
            } else {
                console.error('API returned non-array data:', data);
                setVideos([]);
            }
        } catch (error) {
            console.error('Failed to fetch videos', error);
        }
    };

    useEffect(() => {
        fetchVideos();
    }, [filterStatus, filterSensitivity, filterCategory, filterStartDate, filterEndDate, filterMinSize]);

    const handleDeleteVideo = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
            try {
                await api.delete(`/videos/${id}`);
                setVideos(videos.filter(video => video._id !== id));
            } catch (error) {
                console.error('Failed to delete video', error);
                alert('Failed to delete video');
            }
        }
    };

    useEffect(() => {
        const socket = getSocket();

        socket.on('videoStatusUpdate', (data: { videoId: string, status: string, progress: number, sensitivityStatus?: string }) => {
            setVideos(prevVideos => prevVideos.map(video => {
                if (video._id === data.videoId) {
                    return {
                        ...video,
                        status: data.status as any,
                        progress: data.progress,
                        sensitivityStatus: (data.sensitivityStatus as any) || video.sensitivityStatus
                    };
                }
                return video;
            }));
        });

        return () => {
            socket.off('videoStatusUpdate');
        };
    }, []);

    const filteredAndSortedVideos = Array.isArray(videos) ? videos.sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (sortBy === 'size_desc') return (b.size || 0) - (a.size || 0);
        return 0;
    }) : [];

    const StatusBadge = ({ status, sensitivity }: { status: string, sensitivity: string }) => {
        if (status === 'processing') {
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100/10 text-yellow-400 border border-yellow-400/20"><Clock className="w-3 h-3 mr-1" /> Processing</span>;
        }
        if (status === 'failed') {
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100/10 text-red-400 border border-red-400/20">Failed</span>;
        }
        if (sensitivity === 'safe') {
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100/10 text-green-400 border border-green-400/20"><CheckCircle className="w-3 h-3 mr-1" /> Safe</span>;
        }
        if (sensitivity === 'flagged') {
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100/10 text-red-500 border border-red-500/20"><AlertOctagon className="w-3 h-3 mr-1" /> Flagged</span>;
        }
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100/10 text-gray-400 border border-gray-500/20">Pending</span>;
    };

    return (
        <div className="space-y-8">
            <div className="bg-white shadow-xl sm:rounded-2xl p-6 border border-gray-100">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Upload New Video</h2>
                <UploadVideo onUploadSuccess={fetchVideos} />
            </div>

            {selectedVideoId && (
                <div className="bg-gray-900 shadow-2xl sm:rounded-2xl overflow-hidden ring-1 ring-white/10">
                    <div className="p-4 bg-gray-800/50 flex justify-between items-center border-b border-gray-700">
                        <h3 className="text-lg font-medium text-white flex items-center"><Play className="w-5 h-5 mr-2 text-indigo-400" /> Now Playing</h3>
                        <button onClick={() => setSelectedVideoId(null)} className="text-sm text-gray-400 hover:text-white transition-colors">Close Player</button>
                    </div>
                    <div className="p-6">
                        <VideoPlayer videoId={selectedVideoId} />
                    </div>
                </div>
            )}

            <div>
                <div className="flex flex-col space-y-4 mb-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-2xl font-bold text-gray-900">Your Library</h3>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="block pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-lg shadow-sm"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="size_desc">Largest Size</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                        <div className="lg:col-span-1">
                            <input
                                type="text"
                                placeholder="Category..."
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="block w-full pl-3 pr-3 py-2 text-sm border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div className="lg:col-span-1">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-lg shadow-sm"
                            >
                                <option value="">All Status</option>
                                <option value="processing">Processing</option>
                                <option value="completed">Completed</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>
                        <div className="lg:col-span-1">
                            <select
                                value={filterSensitivity}
                                onChange={(e) => setFilterSensitivity(e.target.value)}
                                className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-lg shadow-sm"
                            >
                                <option value="">All Safety</option>
                                <option value="safe">Safe</option>
                                <option value="flagged">Flagged</option>
                            </select>
                        </div>
                        <div className="lg:col-span-1">
                            <input
                                type="date"
                                value={filterStartDate}
                                onChange={(e) => setFilterStartDate(e.target.value)}
                                className="block w-full pl-3 pr-3 py-2 text-sm border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div className="lg:col-span-1">
                            <input
                                type="date"
                                value={filterEndDate}
                                onChange={(e) => setFilterEndDate(e.target.value)}
                                className="block w-full pl-3 pr-3 py-2 text-sm border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div className="lg:col-span-1">
                            <input
                                type="number"
                                placeholder="Min Size (Bytes)"
                                value={filterMinSize}
                                onChange={(e) => setFilterMinSize(e.target.value)}
                                className="block w-full pl-3 pr-3 py-2 text-sm border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAndSortedVideos.map((video) => (
                        <div key={video._id} className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col group">
                            <div className="h-40 bg-gray-100 relative group-hover:bg-gray-200 transition-colors flex items-center justify-center overflow-hidden">
                                {video.thumbnail ? (
                                    <img
                                        src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${video.thumbnail}`}
                                        alt={video.title}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="text-indigo-200">
                                        <Play className="w-12 h-12 opacity-50" />
                                    </div>
                                )}

                                {video.status === 'processing' && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <div className="w-2/3 bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                            <div className="bg-indigo-500 h-1.5 rounded-full animate-pulse" style={{ width: `${video.progress || 0}%` }}></div>
                                        </div>
                                    </div>
                                )}

                                <div className="absolute top-2 right-2 flex space-x-1">
                                    <StatusBadge status={video.status} sensitivity={video.sensitivityStatus} />
                                </div>

                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteVideo(video._id); }}
                                    className="absolute top-2 left-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-red-500/80 transition-colors opacity-0 group-hover:opacity-100"
                                    title="Delete Video"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="p-5 flex-1 flex flex-col">
                                <h4 className="text-lg font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">{video.title}</h4>
                                <p className="mt-2 text-sm text-gray-500 line-clamp-2">{video.description}</p>

                                <div className="mt-auto pt-4 flex items-center justify-between">
                                    <span className="text-xs text-gray-400">
                                        {new Date(video.createdAt).toLocaleDateString()}
                                    </span>
                                    {video.status === 'completed' && video.sensitivityStatus === 'safe' && (
                                        <button
                                            onClick={() => setSelectedVideoId(video._id)}
                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-transform hover:scale-105"
                                        >
                                            <Play className="h-3 w-3 mr-1" /> Watch
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredAndSortedVideos.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            <p>No videos found matching your filters.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
