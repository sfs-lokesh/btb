import mongoose, { Schema } from 'mongoose';

const TicketSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['Participant', 'Delegate', 'Sponsor', 'Audience'], required: true },
    price: { type: Number, required: true },
    status: { type: String, enum: ['Valid', 'Used', 'Invalid'], default: 'Valid' },
    qrCodeData: { type: String, required: true, unique: true },
    scannedAt: { type: Date },
    scannedBy: { type: Schema.Types.ObjectId, ref: 'User' }, // Manager who scanned
}, { timestamps: true });

export default mongoose.models.Ticket || mongoose.model('Ticket', TicketSchema);
