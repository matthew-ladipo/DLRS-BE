import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'lecturer', 'admin'], default: 'student' },
  studentId: { type: String },
  lecturerId: { type: String },
  department: { type: String },
  specialization: { type: String },
  isVerified: { type: Boolean, default: false },
  emailToken: { type: String },
  emailTokenExpires: { type: Date },
  resetToken: { type: String },
  resetTokenExpires: { type: Date },


}, { timestamps: true });

export default mongoose.model('User', userSchema);
