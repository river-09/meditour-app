import express from 'express';
import mongoose from 'mongoose';
import { getAuth } from '@clerk/express';
import DoctorProfile from '../models/DoctorProfile.js';

const router = express.Router();

// Create or update doctor profile
router.post('/profile', async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const {
      fullName,
      specialization,
      qualification,
      experience,
      consultationFee,
      clinicAddress,
      phoneNumber,
      email,
      bio,
      languages,
      availability
    } = req.body;

    // Validate required fields
    if (!fullName || !specialization || !qualification || !experience || !consultationFee || !clinicAddress || !phoneNumber || !email) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const profileData = {
      doctorId: userId,
      fullName,
      specialization,
      qualification,
      experience: parseInt(experience),
      consultationFee: parseFloat(consultationFee),
      clinicAddress,
      phoneNumber,
      email,
      bio,
      languages: languages || [],
      availability,
      isProfileComplete: true
    };

    // Update existing profile or create new one
    const profile = await DoctorProfile.findOneAndUpdate(
      { doctorId: userId },
      profileData,
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      message: 'Profile updated successfully',
      profile
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get doctor profile
router.get('/profile', async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const profile = await DoctorProfile.findOne({ doctorId: userId });
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all doctors for patients (public route)
router.get('/all', async (req, res) => {
  try {
    const { specialization, search, page = 1, limit = 10 } = req.query;
    
    let query = { isProfileComplete: true };
    
    if (specialization) {
      query.specialization = specialization;
    }
    
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
        { 'clinicAddress': { $regex: search, $options: 'i' } }
      ];
    }

    const doctors = await DoctorProfile.find(query)
      .select('-doctorId -email -phoneNumber')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ rating: -1, createdAt: -1 });

    const total = await DoctorProfile.countDocuments(query);

    res.status(200).json({
      doctors,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
