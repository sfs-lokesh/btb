
import mongoose, { Schema, Document } from 'mongoose';

export interface IVerification extends Document {
    email: string;
    otp: string;
    verified: boolean;
    expiresAt: Date;
}

const VerificationSchema = new Schema({
    email: { type: String, required: true, unique: true },
    otp: { type: String, required: true },
    verified: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true, index: { expires: '15m' } } // Auto-delete after 15 mins
}, { timestamps: true });

export default mongoose.models.Verification || mongoose.model<IVerification>('Verification', VerificationSchema);
