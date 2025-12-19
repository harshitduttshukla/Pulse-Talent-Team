import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    username: string;
    email: string;
    passwordHash: string;
    role: 'viewer' | 'editor' | 'admin';
    resetPasswordToken?: string;
    resetPasswordExpire?: Date;
    createdAt: Date;
}

const UserSchema: Schema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['viewer', 'editor', 'admin'], default: 'viewer' },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
