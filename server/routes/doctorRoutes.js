import express from 'express';
import mongoose from 'mongoose';
import { getAuth } from '@clerk/express';
import DoctorProfile from '../models/DoctorProfile.js';

const router = express.Router();

// Public route - Get all doctors for patients (no auth required)
router.get('/all', async (req, res) => {
  try {
    const { specialization, search, page = 1, limit = 10 } = req.query;
    console.log('Search parameters:', { specialization, search, page, limit }); // Debug log

    let query = { isProfileComplete: true };

    if (specialization) {
      // Case-insensitive specialization search
      query.specialization = { $regex: new RegExp(`^${specialization}$`, 'i') };
    }

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
        { 'clinicAddress': { $regex: search, $options: 'i' } }
      ];
    }

    console.log('MongoDB query:', JSON.stringify(query, null, 2)); // Debug log

    const doctors = await DoctorProfile.find(query)
      .select('-doctorId -email -phoneNumber')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ rating: -1, createdAt: -1 });

    const total = await DoctorProfile.countDocuments(query);

    console.log(`Found ${doctors.length} doctors, total: ${total}`); // Debug log
    console.log('Doctor specializations found:', doctors.map(d => d.specialization)); // Debug log

    res.status(200).json({
      doctors,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// In doctorRoutes.js, complete these routes:

router.post('/profile', async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const profileData = req.body;
    
    // Check if profile exists
    let doctorProfile = await DoctorProfile.findOne({ doctorId: userId });
    
    if (doctorProfile) {
      // Update existing profile
      Object.assign(doctorProfile, profileData);
      doctorProfile.isProfileComplete = true;
      await doctorProfile.save();
    } else {
      // Create new profile
      doctorProfile = new DoctorProfile({
        ...profileData,
        doctorId: userId,
        isProfileComplete: true
      });
      await doctorProfile.save();
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      profile: doctorProfile
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/profile', async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const doctorProfile = await DoctorProfile.findOne({ doctorId: userId });
    
    if (!doctorProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json(doctorProfile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


export default router;
