import mongoose, { Schema } from 'mongoose';

const InfluencerCouponSchema = new Schema({
    code: { type: String, required: true, unique: true, index: true },
    discountAmount: { type: Number, required: true },
    usageLimit: { type: Number, default: null }, // null means unlimited
    usedCount: { type: Number, default: 0 },
    expiryDate: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }, // Admin who created it
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.InfluencerCoupon || mongoose.model('InfluencerCoupon', InfluencerCouponSchema);
