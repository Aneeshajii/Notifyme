import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  tagId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  senderInfo: string;
  content: string;
  isRead: boolean;
  messageType: 'text' | 'voice' | 'location';
  mediaUrl?: string; // For voice notes or location maps
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema = new Schema({
  tagId: { type: Schema.Types.ObjectId, ref: 'Tag', required: true },
  receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  senderInfo: { type: String, required: true },
  content: { type: String },
  isRead: { type: Boolean, default: false },
  messageType: { type: String, enum: ['text', 'voice', 'location'], default: 'text' },
  mediaUrl: { type: String }
}, { timestamps: true });

export default mongoose.model<IMessage>('Message', MessageSchema);
