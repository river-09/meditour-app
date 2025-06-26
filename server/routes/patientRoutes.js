import express from 'express';
import mongoose from 'mongoose';
import upload from '../middleware/upload.js';
import Patient from '../models/Patient.js';
import DoctorProfile from '../models/DoctorProfile.js';
import { getAuth } from '@clerk/express';
import ReviewRequest from '../models/ReviewRequest.js';
import Appointment from '../models/Appointment.js';

const router = express.Router();

// Create or update patient profile
router.post('/profile', upload.array('medicalReports', 5), async (req, res) => {
  try {
    const {
      clerkUserId,
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      height,
      weight,
      bloodGroup,
      emergencyContact,
      emergencyPhone,
      allergies,
      currentMedications,
      pastIllnesses,
      surgicalHistory,
      familyMedicalHistory,
      smokingStatus,
      drinkingStatus,
      exerciseFrequency,
      dietaryRestrictions
    } = req.body;

    // Handle uploaded files
    const medicalReports = req.files ? req.files.map(file => ({
      fileName: file.filename,
      originalName: file.originalname,
      filePath: file.path,
      fileSize: file.size
    })) : [];

    // Check if patient already exists
    let patient = await Patient.findByClerkId(clerkUserId);

    if (patient) {
      // Update existing patient
      Object.assign(patient, {
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : patient.dateOfBirth,
        gender,
        height: height ? Number(height) : patient.height,
        weight: weight ? Number(weight) : patient.weight,
        bloodGroup,
        emergencyContact,
        emergencyPhone,
        allergies,
        currentMedications,
        pastIllnesses,
        surgicalHistory,
        familyMedicalHistory,
        smokingStatus,
        drinkingStatus,
        exerciseFrequency,
        dietaryRestrictions,
        medicalReports: [...(patient.medicalReports || []), ...medicalReports],
        isProfileComplete: true
      });
    } else {
      // Create new patient
      patient = new Patient({
        clerkUserId,
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        height: height ? Number(height) : undefined,
        weight: weight ? Number(weight) : undefined,
        bloodGroup,
        emergencyContact,
        emergencyPhone,
        allergies,
        currentMedications,
        pastIllnesses,
        surgicalHistory,
        familyMedicalHistory,
        smokingStatus,
        drinkingStatus,
        exerciseFrequency,
        dietaryRestrictions,
        medicalReports,
        isProfileComplete: true
      });
    }

    await patient.save();

    res.status(201).json({
      success: true,
      message: 'Profile saved successfully',
      patient: {
        id: patient._id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        isProfileComplete: patient.isProfileComplete
      }
    });

  } catch (error) {
    console.error('Error saving patient profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save profile',
      error: error.message
    });
  }
});

// Get patient profile
router.get('/profile/:clerkUserId', async (req, res) => {
  try {
    const { clerkUserId } = req.params;
    const patient = await Patient.findByClerkId(clerkUserId);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    res.json({
      success: true,
      patient
    });

  } catch (error) {
    console.error('Error fetching patient profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
});

// Check if profile exists
router.get('/profile-status/:clerkUserId', async (req, res) => {
  try {
    const { clerkUserId } = req.params;
    const patient = await Patient.findByClerkId(clerkUserId);

    res.json({
      success: true,
      exists: !!patient,
      isComplete: patient?.isProfileComplete || false
    });

  } catch (error) {
    console.error('Error checking profile status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check profile status',
      error: error.message
    });
  }
});

// Get all specializations
router.get('/find-doctors', async (req, res) => {
  try {
    const specializations = [
      'Cardiology', 'Dermatology', 'Neurology', 'Orthopedics',
      'Pediatrics', 'Psychiatry', 'General Medicine', 'Surgery',
      'Gynecology', 'Ophthalmology', 'ENT', 'Radiology'
    ];
    
    res.json({
      success: true,
      specializations
    });

  } catch (error) {
    console.error('Error fetching specializations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch specializations',
      error: error.message
    });
  }
});

// Get doctors by specialization (public route for patients)
router.get('/doctors/by-specialization/:specialization', async (req, res) => {
  try {
    const { specialization } = req.params;
    const { search, page = 1, limit = 10 } = req.query;
    
    let query = { 
      specialization: specialization,
      isProfileComplete: true 
    };
    
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { clinicAddress: { $regex: search, $options: 'i' } }
      ];
    }
    
    const doctors = await DoctorProfile.find(query)
      .select('-doctorId -email -phoneNumber') // Hide sensitive info
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ rating: -1, createdAt: -1 });
    
    const total = await DoctorProfile.countDocuments(query);
    
    res.json({
      success: true,
      doctors,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Error fetching doctors by specialization:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctors',
      error: error.message
    });
  }
});

// Get specific doctor details
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const doctor = await DoctorProfile.findById(doctorId);
    // ✅ DON'T exclude doctorId - we need it for review requests
    // Remove this line: .select('-doctorId -email -phoneNumber');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // ✅ Return doctor with doctorId but hide sensitive info
    const doctorData = doctor.toObject();
    delete doctorData.email;
    delete doctorData.phoneNumber;
    // Keep doctorId - it's needed for review requests

    res.json({
      success: true,
      doctor: doctorData
    });
  } catch (error) {
    console.error('Error fetching doctor details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor details',
      error: error.message
    });
  }
});

router.get('/review-requests/:patientId', async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { patientId } = req.params;

    if (userId !== patientId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const requests = await ReviewRequest.find({ patientId })
      .sort({ submittedOn: -1 })
      .limit(10);

    res.json({
      success: true,
      requests
    });
  } catch (error) {
    console.error('Error fetching patient review requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get patient's appointments
router.get('/appointments/:patientId', async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { patientId } = req.params;
    const { status } = req.query;

    if (userId !== patientId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    let query = { patientId };
    if (status && status !== 'all') {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .sort({ scheduledDate: -1 });

    res.json({
      success: true,
      appointments
    });
  } catch (error) {
    console.error('Error fetching patient appointments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get patient's upcoming calls
router.get('/upcoming-calls/:patientId', async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { patientId } = req.params;

    if (userId !== patientId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    const calls = await Appointment.find({
      patientId,
      status: 'scheduled',
      scheduledDate: {
        $gte: now,
        $lte: nextWeek
      }
    }).sort({ scheduledDate: 1 });

    res.json({
      success: true,
      calls
    });
  } catch (error) {
    console.error('Error fetching upcoming calls:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


export default router;
