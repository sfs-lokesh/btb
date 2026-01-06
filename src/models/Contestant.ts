
import mongoose, { Schema, Document } from 'mongoose';

export interface IContestant extends Document {
    name: string;
    teamName: string;
    image?: string;
    imageBuffer?: Buffer;
    imageType?: string;
    projectTitle: string;
    projectDescription: string;
    projectLinks?: string;
    category: string;
    isActive: boolean;
    votes: { userId: string; type: 'up' | 'down'; timestamp: Date }[];
    voteCount: number;
}

const VoteSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['up', 'down'], required: true },
    timestamp: { type: Date, default: Date.now }
});

const ContestantSchema = new Schema({
    name: { type: String, required: true },
    teamName: { type: String, required: true },
    image: { type: String }, // URL (keeping for backward compatibility or if external URL is used)
    imageBuffer: { type: Buffer },
    imageType: { type: String },
    projectTitle: { type: String, required: true },
    projectDescription: { type: String, required: true },
    projectLinks: { type: String },
    category: { type: String, required: true },
    isActive: { type: Boolean, default: false },
    votes: { type: [VoteSchema], default: [] },
    voteCount: { type: Number, default: 0 }
}, { timestamps: true });

// Index to ensure fast lookups for active contestant
ContestantSchema.index({ isActive: 1 });

export default mongoose.models.Contestant || mongoose.model<IContestant>('Contestant', ContestantSchema);
