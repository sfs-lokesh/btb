import mongoose, { Schema } from 'mongoose';

// Delete the cached model to ensure new schema is used
if (mongoose.models.College) {
    delete mongoose.models.College;
}

const CollegeSchema = new Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true, index: true }, // College-specific coupon code
    discountAmount: { type: Number, required: true },
    earnings: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 }, // Amount already paid to college
    registrations: { type: Number, default: 0 },
    expiryDate: { type: Date },
    usageLimit: { type: Number },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('College', CollegeSchema);
