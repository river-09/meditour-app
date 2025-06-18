import mongoose from "mongoose";
const appointmentSchema = new mongoose.Schema({
  reviewRequestId: {
    type: String,
    ref: 'ReviewRequest',
    required: true
  },
  doctorId: {
    type: String,
    ref: 'Doctor',
    required: true
  },
  patientId: {
    type: String,
    ref: 'Patient',
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  doctorName: {
    type: String,
    required: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    default: 30
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  dailyRoomUrl: {
    type: String,
    required: true
  },
  dailyRoomName: {
    type: String,
    required: true
  },
  meetingNotes: {
    type: String,
    maxlength: 2000
  },
  consultationFee: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Index for efficient queries
appointmentSchema.index({ doctorId: 1, scheduledDate: 1 });
appointmentSchema.index({ patientId: 1, scheduledDate: 1 });
appointmentSchema.index({ status: 1, scheduledDate: 1 });

export default mongoose.model('Appointment', appointmentSchema);
