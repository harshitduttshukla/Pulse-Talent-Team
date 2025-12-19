import React, { useState, useRef, useContext } from 'react';
import api from '../api/axios';
import { Upload, X, FileVideo, AlertCircle, CheckCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

interface UploadVideoProps {
    onUploadSuccess: () => void;
}

const UploadVideo: React.FC<UploadVideoProps> = ({ onUploadSuccess }) => {
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null); // Initialize inputRef
    const [file, setFile] = useState<File | null>(null); // Initialize file state
    const [title, setTitle] = useState(''); // Initialize title state
    const [description, setDescription] = useState(''); // Initialize description state
    const [category, setCategory] = useState(''); // Initialize category state
    const [uploading, setUploading] = useState(false); // Initialize uploading state
    const [message, setMessage] = useState(''); // Initialize message state

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const onButtonClick = () => {
        inputRef.current?.click();
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !file) {
            setMessage('Please select a video file and enter a title.');
            return;
        }

        const formData = new FormData();
        formData.append('video', file);
        formData.append('title', title);
        formData.append('description', description);
        if (category) formData.append('category', category);

        setUploading(true);
        setMessage('');

        try {
            await api.post('/videos', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setMessage('Upload successful! Processing started.');
            setFile(null);
            setTitle('');
            setDescription('');
            setCategory('');
            onUploadSuccess();
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || (error.response?.data?.errors && error.response.data.errors[0]?.msg) || 'Upload failed';
            setMessage('Upload failed: ' + errorMsg);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white shadow sm:rounded-lg p-6 mb-8">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Upload New Video</h3>
            <form onSubmit={handleUpload} className="space-y-4" onDragEnter={handleDrag}>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Video Title</label>
                    <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="e.g. Education, Music"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>

                {/* Drag and Drop Zone */}
                <div
                    className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <div className="space-y-1 text-center">
                        {file ? (
                            <div className="flex flex-col items-center">
                                <FileVideo className="mx-auto h-12 w-12 text-indigo-500" />
                                <div className="flex text-sm text-gray-600 mt-2">
                                    <span className="font-medium text-indigo-600 truncate max-w-xs">{file.name}</span>
                                </div>
                                <p className="text-xs text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                <button type="button" onClick={() => setFile(null)} className="mt-2 text-sm text-red-600 hover:text-red-500">Remove</button>
                            </div>
                        ) : (
                            <>
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600">
                                    <label
                                        htmlFor="file-upload"
                                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                                    >
                                        <span>Upload a file</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" ref={inputRef} onChange={handleChange} accept="video/*" />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">MP4, WebM, OGG up to 100MB</p>
                            </>
                        )}
                    </div>
                </div>

                {message && <p className={`text-sm ${message.includes('failed') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>}

                <button
                    type="submit"
                    disabled={uploading}
                    className={`w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {uploading ? 'Uploading...' : <><Upload className="mr-2 h-4 w-4" /> Upload Video</>}
                </button>
            </form>
        </div>
    );
};

export default UploadVideo;
