const express = require('express');
const Patient = require('../models/Patient');
const upload = require('../middleware/upload');
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

module.exports = router;
