import { getAuth } from '@clerk/express';

// Custom auth middleware that extracts user info
export const auth = (req, res, next) => {
  try {
    const { userId, sessionId, orgId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ 
        message: 'Authentication required',
        error: 'No valid session found' 
      });
    }

    // Attach user info to request object
    req.user = {
      id: userId,
      sessionId: sessionId,
      orgId: orgId
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ 
      message: 'Authentication failed',
      error: error.message 
    });
  }
};

// Middleware to check if user is a doctor
export const requireDoctor = (req, res, next) => {
  const { userId } = getAuth(req);
  
  if (!userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // You can add additional role checking logic here
  // For now, we'll assume all authenticated users can be doctors
  req.user = { id: userId, role: 'doctor' };
  next();
};

// Middleware to check if user is a patient
export const requirePatient = (req, res, next) => {
  const { userId } = getAuth(req);
  
  if (!userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  req.user = { id: userId, role: 'patient' };
  next();
};
