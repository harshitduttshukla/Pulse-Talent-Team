import mongoose, { Schema, Document } from 'mongoose';

export interface IVideo extends Document {
    title: string;
    description: string;
    filename: string;
    originalName: string;
    uploader: mongoose.Types.ObjectId;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    sensitivityStatus: 'pending' | 'safe' | 'flagged';
    duration: number;
    size: number;
    category?: string;
    thumbnail?: string;
    createdAt: Date;
}

const VideoSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
    sensitivityStatus: { type: String, enum: ['pending', 'safe', 'flagged'], default: 'pending' },
    duration: { type: Number },
    size: { type: Number },
    category: { type: String },
    thumbnail: { type: String },
}, { timestamps: true });

export default mongoose.model<IVideo>('Video', VideoSchema);
