import mongoose from "mongoose";
const patientSchema = new mongoose.Schema({
  // Clerk User ID for authentication
  clerkUserId: {
    type: String,
    required: true,
    unique: true
  },
  
  // Personal Information
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female', 'other', 'prefer-not-to-say']
  },
  
  // Physical Information
  height: {
    type: Number, // in cm
    min: 0
  },
  weight: {
    type: Number, // in kg
    min: 0
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  
  // Emergency Contact
  emergencyContact: {
    type: String,
    required: true,
    trim: true
  },
  emergencyPhone: {
    type: String,
    required: true,
    trim: true
  },
  
  // Medical History
  allergies: {
    type: String,
    trim: true
  },
  currentMedications: {
    type: String,
    trim: true
  },
  pastIllnesses: {
    type: String,
    trim: true
  },
  surgicalHistory: {
    type: String,
    trim: true
  },
  familyMedicalHistory: {
    type: String,
    trim: true
  },
  
  // Lifestyle Information
  smokingStatus: {
    type: String,
    enum: ['never', 'former', 'current']
  },
  drinkingStatus: {
    type: String,
    enum: ['never', 'occasional', 'regular', 'former']
  },
  exerciseFrequency: {
    type: String,
    enum: ['none', 'light', 'moderate', 'heavy']
  },
  dietaryRestrictions: {
    type: String,
    trim: true
  },
  
  // Medical Reports (file paths)
  medicalReports: [{
    fileName: String,
    originalName: String,
    filePath: String,
    uploadDate: {
      type: Date,
      default: Date.now
    },
    fileSize: Number
  }],
  
  // Profile Status
  isProfileComplete: {
    type: Boolean,
    default: false
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
patientSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to mark profile as complete
patientSchema.methods.markProfileComplete = function() {
  this.isProfileComplete = true;
  return this.save();
};

// Static method to find patient by Clerk ID
patientSchema.statics.findByClerkId = function(clerkUserId) {
  return this.findOne({ clerkUserId });
};

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;