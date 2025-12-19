import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import VideoPlayer from '../components/VideoPlayer';
import { Play, Clock } from 'lucide-react';

interface Video {
    _id: string;
    title: string;
    description: string;
    uploader: {
        username: string;
    };
    createdAt: string;
    size?: number;
    category?: string;
}

const Library = () => {
    const [videos, setVideos] = useState<Video[]>([]);
    const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
    const [filterCategory, setFilterCategory] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');

    const fetchVideos = async () => {
        try {
            const params = new URLSearchParams();
            params.append('public', 'true'); // Fetch public videos
            if (filterCategory) params.append('category', filterCategory);

            const { data } = await api.get(`/videos?${params.toString()}`);
            setVideos(data.reverse());
        } catch (error) {
            console.error('Failed to fetch videos', error);
        }
    };

    useEffect(() => {
        fetchVideos();
    }, [filterCategory]);

    const filteredVideos = videos.filter(video =>
        video.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Public Library</h2>
                    <p className="mt-2 text-gray-500">Discover videos from the SafeStream community</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Search videos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-4 pr-4 py-2 text-sm border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <div className="sm:w-64">
                    <input
                        type="text"
                        placeholder="Filter by Category..."
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="block w-full pl-4 pr-4 py-2 text-sm border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
            </div>

            {selectedVideoId && (
                <div className="bg-gray-900 shadow-2xl sm:rounded-2xl overflow-hidden ring-1 ring-white/10 mb-8">
                    <div className="p-4 bg-gray-800/50 flex justify-between items-center border-b border-gray-700">
                        <h3 className="text-lg font-medium text-white flex items-center"><Play className="w-5 h-5 mr-2 text-indigo-400" /> Now Playing</h3>
                        <button onClick={() => setSelectedVideoId(null)} className="text-sm text-gray-400 hover:text-white transition-colors">Close Player</button>
                    </div>
                    <div className="p-6">
                        <VideoPlayer videoId={selectedVideoId} />
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVideos.map((video) => (
                    <div key={video._id} className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col group cursor-pointer" onClick={() => setSelectedVideoId(video._id)}>
                        <div className="h-48 bg-gray-100 relative group-hover:bg-gray-200 transition-colors flex items-center justify-center overflow-hidden">
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
                                <div className="text-indigo-200 transform group-hover:scale-110 transition-transform duration-300">
                                    <Play className="w-16 h-16 opacity-50" />
                                </div>
                            )}
                            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                                {video.category || 'Uncategorized'}
                            </div>
                        </div>

                        <div className="p-5 flex-1 flex flex-col">
                            <h4 className="text-lg font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">{video.title}</h4>
                            <p className="mt-1 text-sm text-gray-500 line-clamp-2">{video.description || 'No description'}</p>

                            <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                                <div className="flex items-center">
                                    <span className="font-medium text-gray-600">{video.uploader?.username || 'Unknown'}</span>
                                </div>
                                <div className="flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {new Date(video.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredVideos.length === 0 && (
                    <div className="col-span-full py-16 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <p className="text-lg">No public videos found matching your filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Library;
