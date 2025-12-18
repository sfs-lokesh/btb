import mongoose, { Schema } from 'mongoose';

const StallSchema = new Schema({
    name: { type: String, required: true }, // e.g., "Stall A1"
    location: { type: String },
    category: { type: String, enum: ['Premium', 'Standard', 'Economy'], required: true },
    price: { type: Number, required: true },
    status: { type: String, enum: ['Available', 'Booked', 'OnHold'], default: 'Available' },
    bookedBy: { type: Schema.Types.ObjectId, ref: 'User' }, // Sponsor who booked
    requestStatus: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }, // NEW: For approval workflow
    bookingDetails: {
        firstName: String,
        lastName: String,
        contact: String,
        email: String,
        paymentMethod: { type: String, default: 'Offline' },
        bookingDate: { type: Date, default: Date.now },
    }
}, { timestamps: true });

export default mongoose.models.Stall || mongoose.model('Stall', StallSchema);
