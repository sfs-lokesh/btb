
import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['Participant', 'Audience', 'Delegate', 'Sponsor', 'Admin', 'Manager', 'SuperAdmin', 'SponsorAdmin'], required: true },

  // Participant-specific fields
  phone: { type: String },
  college: { type: String }, // Keeping for legacy or direct text entry if needed, but collegeId is better for relation
  collegeId: { type: Schema.Types.ObjectId, ref: 'College' },

  // Team & Project Details
  teamType: { type: String, enum: ['Solo', 'Team of 2', 'Team of 3', 'Team of 4'] },
  teamName: { type: String },
  teamMembers: { type: [String] }, // Array of strings for names

  category: { type: String, enum: ['Web Development', 'App Development', 'Software', 'VFX', '3D', 'Animation', 'Film', 'Product', 'Startup', 'Other'] },
  projectTitle: { type: String },
  projectDescription: { type: String },
  projectLinks: { type: String }, // GitHub/Drive link

  skillVerification: { type: Boolean, default: false },

  // Payment & Access
  couponUsed: { type: String }, // The code of the coupon used
  paymentStatus: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' },
  qrCode: { type: String }, // URL or unique string for QR

  // Sponsor/Delegate specific
  companyName: { type: String },
  designation: { type: String },

  // Profile Image stored as Blob
  profileImage: { type: Buffer },
  profileImageType: { type: String },

  // Password Reset
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },

  // Email Verification
  emailVerified: { type: Boolean, default: false },
  otp: { type: String, select: false },
  otpExpires: { type: Date, select: false },

}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};


export default mongoose.models.User || mongoose.model('User', UserSchema);
