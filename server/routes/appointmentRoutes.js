import express from 'express';
import mongoose from 'mongoose';
import { getAuth } from '@clerk/express';
import Appointment from '../models/Appointment.js';
import ReviewRequest from '../models/ReviewRequest.js';
import DoctorProfile from '../models/DoctorProfile.js';
import dailyService from '../services/dailyService.js';

const router = express.Router();

// Create appointment after approving review request
router.post('/create-from-request', async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { 
      reviewRequestId, 
      scheduledDate, 
      duration = 30 
    } = req.body;

    // Validate required fields
    if (!reviewRequestId || !scheduledDate) {
      return res.status(400).json({ 
        message: 'Review request ID and scheduled date are required' 
      });
    }

    // Get the review request
    const reviewRequest = await ReviewRequest.findById(reviewRequestId);
    if (!reviewRequest) {
      return res.status(404).json({ message: 'Review request not found' });
    }

    // Verify doctor owns this request (no .toString() needed for Clerk IDs)
    if (reviewRequest.doctorId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get doctor profile for consultation fee
    const doctorProfile = await DoctorProfile.findOne({ doctorId: userId });
    if (!doctorProfile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    // Create Daily.co room
    const appointmentId = new mongoose.Types.ObjectId();
    const dailyRoom = await dailyService.createRoom(
      appointmentId, 
      new Date(scheduledDate), 
      duration
    );

    // Create appointment
    const appointment = new Appointment({
      _id: appointmentId,
      reviewRequestId,
      doctorId: userId,
      patientId: reviewRequest.patientId,
      patientName: reviewRequest.patientName,
      doctorName: doctorProfile.fullName,
      scheduledDate: new Date(scheduledDate),
      duration,
      dailyRoomUrl: dailyRoom.roomUrl,
      dailyRoomName: dailyRoom.roomName,
      consultationFee: doctorProfile.consultationFee,
      status: 'scheduled'
    });

    await appointment.save();

    // Update review request status
    reviewRequest.status = 'approved';
    reviewRequest.reviewedOn = new Date();
    await reviewRequest.save();

    res.status(201).json({
      message: 'Appointment scheduled successfully',
      appointment: {
        ...appointment.toObject(),
        dailyRoomUrl: dailyRoom.roomUrl
      }
    });

  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get appointments for doctor (FIXED: removed .populate())
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { doctorId } = req.params;
    const { status, date, page = 1, limit = 10 } = req.query;

    // Verify access
    if (userId !== doctorId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    let query = { doctorId };
    
    if (status && status !== 'all') {
      query.status = status;
    }

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.scheduledDate = { $gte: startDate, $lt: endDate };
    }

    // FIXED: Removed .populate() since patientId is not an ObjectId reference
    const appointments = await Appointment.find(query)
      .sort({ scheduledDate: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Appointment.countDocuments(query);

    res.status(200).json({
      appointments,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });

  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get upcoming calls for doctor (FIXED: removed .populate())
router.get('/doctor/:doctorId/upcoming', async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { doctorId } = req.params;
    
    // Verify access
    if (userId !== doctorId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get current time and next 7 days
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    // FIXED: Removed .populate() since patientId is not an ObjectId reference
    const upcomingAppointments = await Appointment.find({
      doctorId,
      status: 'scheduled',
      scheduledDate: {
        $gte: now,
        $lte: nextWeek
      }
    })
    .sort({ scheduledDate: 1 })
    .limit(10);

    res.status(200).json({
      appointments: upcomingAppointments,
      total: upcomingAppointments.length
    });

  } catch (error) {
    console.error('Get upcoming calls error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get appointment statistics for doctor
router.get('/doctor/:doctorId/stats', async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { doctorId } = req.params;
    
    if (userId !== doctorId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const totalAppointments = await Appointment.countDocuments({ 
      doctorId,
      status: { $in: ['scheduled', 'completed', 'in-progress'] }
    });

    const completedAppointments = await Appointment.countDocuments({ 
      doctorId,
      status: 'completed'
    });

    const scheduledAppointments = await Appointment.countDocuments({ 
      doctorId,
      status: 'scheduled'
    });

    const cancelledAppointments = await Appointment.countDocuments({ 
      doctorId,
      status: 'cancelled'
    });

    res.status(200).json({
      total: totalAppointments,
      completed: completedAppointments,
      scheduled: scheduledAppointments,
      cancelled: cancelledAppointments
    });

  } catch (error) {
    console.error('Get appointment stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get unique patients count for doctor
router.get('/doctor/:doctorId/patients-count', async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { doctorId } = req.params;
    
    if (userId !== doctorId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const uniquePatients = await Appointment.distinct('patientId', { doctorId });

    res.status(200).json({
      uniquePatients: uniquePatients.length
    });

  } catch (error) {
    console.error('Get patients count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get detailed patients list for doctor (FIXED: simplified aggregation)
router.get('/doctor/:doctorId/patients', async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { doctorId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    if (userId !== doctorId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // FIXED: Simplified aggregation without ObjectId operations
    const patientsData = await Appointment.aggregate([
      { $match: { doctorId: doctorId } },
      {
        $group: {
          _id: '$patientId',
          patientName: { $first: '$patientName' },
          latestAppointment: { $max: '$scheduledDate' },
          totalAppointments: { $sum: 1 },
          appointmentStatuses: { $push: '$status' }
        }
      },
      { $sort: { latestAppointment: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: parseInt(limit) }
    ]);

    const totalPatients = await Appointment.distinct('patientId', { doctorId });

    res.status(200).json({
      patients: patientsData,
      totalPages: Math.ceil(totalPatients.length / limit),
      currentPage: parseInt(page),
      total: totalPatients.length
    });

  } catch (error) {
    console.error('Get patients list error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Join video call (FIXED: removed .toString() calls)
router.get('/:appointmentId/join', async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { appointmentId } = req.params;
    
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // FIXED: Direct string comparison for Clerk user IDs
    const isDoctor = appointment.doctorId === userId;
    const isPatient = appointment.patientId === userId;
    
    if (!isDoctor && !isPatient) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if appointment is scheduled for today (within 15 minutes window)
    const now = new Date();
    const appointmentTime = new Date(appointment.scheduledDate);
    const timeDiff = appointmentTime.getTime() - now.getTime();
    const minutesDiff = timeDiff / (1000 * 60);

    if (minutesDiff > 15) {
      return res.status(400).json({ 
        message: 'Call room is not yet available. Please join 15 minutes before scheduled time.' 
      });
    }

    if (minutesDiff < -appointment.duration) {
      return res.status(400).json({ 
        message: 'This appointment has ended.' 
      });
    }

    // Update appointment status if first person joining
    if (appointment.status === 'scheduled') {
      appointment.status = 'in-progress';
      await appointment.save();
    }

    res.status(200).json({
      roomUrl: appointment.dailyRoomUrl,
      roomName: appointment.dailyRoomName,
      appointment: appointment
    });

  } catch (error) {
    console.error('Join call error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update appointment status (FIXED: removed .toString() call)
router.patch('/:appointmentId/status', async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { appointmentId } = req.params;
    const { status, meetingNotes } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // FIXED: Direct string comparison for Clerk user IDs
    if (appointment.doctorId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    appointment.status = status;
    if (meetingNotes) {
      appointment.meetingNotes = meetingNotes;
    }

    await appointment.save();

    res.status(200).json({
      message: 'Appointment updated successfully',
      appointment
    });

  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



export default router;
