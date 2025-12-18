import mongoose, { Schema } from 'mongoose';

const PitchSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  presenter: { type: String, required: true },
  imageUrl: { type: String, required: true },
  category: { type: String, required: true },
  upvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  downvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  visible: { type: Boolean, default: true },
});

export default mongoose.models.Pitch || mongoose.model('Pitch', PitchSchema);
