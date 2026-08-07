import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  googleId?: string;
  isPremium: boolean;
  phoneNumber?: string;
  notificationSettings: {
    pushEnabled: boolean;
    emailEnabled: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  googleId: { type: String },
  isPremium: { type: Boolean, default: false },
  phoneNumber: { type: String },
  notificationSettings: {
    pushEnabled: { type: Boolean, default: true },
    emailEnabled: { type: Boolean, default: true }
  }
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
