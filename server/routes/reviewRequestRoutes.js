import express from 'express';
import mongoose from 'mongoose';
import { getAuth } from '@clerk/express';
import ReviewRequest from '../models/ReviewRequest.js';

const router = express.Router();

// Add middleware to log all route hits
router.use((req, res, next) => {
  console.log(`📋 Review request route: ${req.method} ${req.path}`);
  next();
});




// Your existing routes remain the same...
router.post('/create', async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const {
      doctorId,
      patientName,
      patientEmail,
      condition,
      message
    } = req.body;

    // Validate required fields
    if (!doctorId || !patientName || !patientEmail || !condition) {
      return res.status(400).json({ 
        message: 'Doctor ID, patient name, email, and condition are required' 
      });
    }

    const reviewRequest = new ReviewRequest({
      patientId: userId,
      doctorId,
      patientName,
      patientEmail,
      condition,
      message,
      status: 'pending'
    });

    await reviewRequest.save();

    res.status(201).json({
      message: 'Review request submitted successfully',
      request: reviewRequest
    });

  } catch (error) {
    console.error('Create review request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all review requests for a doctor
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { doctorId } = req.params;
    const { status = 'pending', page = 1, limit = 10 } = req.query;

    // Verify the doctor is requesting their own requests
    if (userId !== doctorId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const query = { doctorId };
    if (status !== 'all') {
      query.status = status;
    }

    const requests = await ReviewRequest.find(query)
      .sort({ submittedOn: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ReviewRequest.countDocuments(query);

    res.status(200).json({
      requests,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      pendingCount: await ReviewRequest.countDocuments({ 
        doctorId, 
        status: 'pending' 
      })
    });

  } catch (error) {
    console.error('Get review requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get dashboard stats for doctor
// Get dashboard stats for doctor
router.get('/stats/:doctorId', async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { doctorId } = req.params;
    
    console.log('🔍 Stats Debug:', {
      requestedDoctorId: doctorId,
      authenticatedUserId: userId,
      match: userId === doctorId
    });

    // Verify the doctor is requesting their own stats
    if (userId !== doctorId) {
      console.log('❌ Access denied: userId !== doctorId');
      return res.status(403).json({ message: 'Access denied' });
    }

    // Add debug query to see what's in the database
    const allRequests = await ReviewRequest.find({ doctorId: doctorId });
    console.log('📋 All requests for doctor:', allRequests.length);
    if (allRequests.length > 0) {
      console.log('📋 Sample request:', {
        id: allRequests[0]._id,
        doctorId: allRequests[0].doctorId,
        patientName: allRequests[0].patientName,
        status: allRequests[0].status
      });
    }

    const stats = await ReviewRequest.aggregate([
      { $match: { doctorId: doctorId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('📊 Aggregated stats:', stats);

    const formattedStats = {
      pending: 0,
      reviewed: 0,
      approved: 0,
      rejected: 0,
      total: 0
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
      formattedStats.total += stat.count;
    });

    console.log('📊 Formatted stats:', formattedStats);
    res.status(200).json(formattedStats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update review request status (approve/reject)
router.patch('/:requestId/status', async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { requestId } = req.params;
    const { status, doctorNotes } = req.body;

    if (!['pending', 'reviewed', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const reviewRequest = await ReviewRequest.findById(requestId);
    
    if (!reviewRequest) {
      return res.status(404).json({ message: 'Review request not found' });
    }

    // Verify the doctor owns this request
    if (reviewRequest.doctorId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    reviewRequest.status = status;
    reviewRequest.reviewedOn = new Date();
    if (doctorNotes) {
      reviewRequest.doctorNotes = doctorNotes;
    }

    await reviewRequest.save();

    res.status(200).json({
      message: 'Review request updated successfully',
      request: reviewRequest
    });

  } catch (error) {
    console.error('Update review request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get detailed review request
router.get('/:requestId', async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { requestId } = req.params;

    const reviewRequest = await ReviewRequest.findById(requestId);
    
    if (!reviewRequest) {
      return res.status(404).json({ message: 'Review request not found' });
    }

    // Verify the doctor owns this request
    if (reviewRequest.doctorId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json(reviewRequest);

  } catch (error) {
    console.error('Get review request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
