import mongoose from 'mongoose';
const reviewRequestSchema = new mongoose.Schema({
  patientId: {
    type: String,
    ref: 'Patient',
    required: true
  },
  doctorId: {
    type: String,
    ref: 'Doctor',
    required: true
  },
  patientName: {
    type: String,
    required: true,
    trim: true
  },
  patientEmail: {
    type: String,
    required: true,
    lowercase: true
  },
  condition: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'approved', 'rejected'],
    default: 'pending'
  },
  submittedOn: {
    type: Date,
    default: Date.now
  },
  reviewedOn: {
    type: Date
  },
  doctorNotes: {
    type: String,
    maxlength: 1000
  }
}, {
  timestamps: true
});

// Index for efficient queries
reviewRequestSchema.index({ doctorId: 1, status: 1 });
reviewRequestSchema.index({ patientId: 1 });

export default mongoose.model('ReviewRequest', reviewRequestSchema);
