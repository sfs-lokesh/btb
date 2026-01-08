
import mongoose, { Schema, Document } from 'mongoose';

export interface ISponsorRequest extends Document {
    name: string;
    businessName: string;
    email: string;
    phone: string;
    status: 'Pending' | 'Contacted' | 'Closed';
    createdAt: Date;
}

const SponsorRequestSchema: Schema = new Schema({
    name: { type: String, required: true },
    businessName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Contacted', 'Closed'], default: 'Pending' },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.SponsorRequest || mongoose.model<ISponsorRequest>('SponsorRequest', SponsorRequestSchema);
