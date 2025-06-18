import mongoose from 'mongoose';
const doctorProfileSchema = new mongoose.Schema({
  doctorId: {
    type: String,
    ref: 'Doctor',
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  specialization: {
    type: String,
    required: true,
    enum: [
      'Cardiology', 'Dermatology', 'Neurology', 'Orthopedics', 
      'Pediatrics', 'Psychiatry', 'General Medicine', 'Surgery',
      'Gynecology', 'Ophthalmology', 'ENT', 'Radiology'
    ]
  },
  qualification: {
    type: String,
    required: true
  },
  experience: {
    type: Number,
    required: true,
    min: 0
  },
  consultationFee: {
    type: Number,
    required: true,
    min: 0
  },
  clinicAddress: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  bio: {
    type: String,
    maxlength: 1000
  },
  languages: [{
    type: String,
    trim: true
  }],
  availability: {
    type: String
  },
  isProfileComplete: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for search functionality
doctorProfileSchema.index({ specialization: 1, 'clinicAddress': 'text', fullName: 'text' });

export default mongoose.model('DoctorProfile', doctorProfileSchema);
