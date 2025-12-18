import mongoose, { Schema } from 'mongoose';

const SponsorSchema = new Schema({
    name: { type: String, required: true },
    tier: { type: String, enum: ['Platinum', 'Gold', 'Silver', 'Bronze'], default: 'Bronze' },
    contactInfo: {
        email: { type: String },
        phone: { type: String },
    },
    paymentStatus: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
    userId: { type: Schema.Types.ObjectId, ref: 'User' }, // Link to a user account if they have one
}, { timestamps: true });

export default mongoose.models.Sponsor || mongoose.model('Sponsor', SponsorSchema);
