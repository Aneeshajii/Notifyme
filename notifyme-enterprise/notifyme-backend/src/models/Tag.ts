import mongoose, { Document, Schema } from 'mongoose';

export interface ITag extends Document {
  ownerId: mongoose.Types.ObjectId;
  tagId: string;
  name: string;
  status: 'active' | 'paused' | 'lost';
  qrCodeDataUrl: string;
  plateNumber?: string;
  scansCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const TagSchema: Schema = new Schema({
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tagId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  status: { type: String, enum: ['active', 'paused', 'lost'], default: 'active' },
  qrCodeDataUrl: { type: String, required: true },
  plateNumber: { type: String },
  scansCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model<ITag>('Tag', TagSchema);
