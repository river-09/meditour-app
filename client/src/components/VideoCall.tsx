import React, { useEffect, useState } from 'react';
import {
  DailyProvider,
  useDaily,
  useParticipantIds,
  useParticipant,
  useLocalParticipant,
  useVideoTrack,
  useAudioTrack,
  DailyVideo,
  DailyAudio
} from '@daily-co/daily-react';

interface VideoCallProps {
  roomUrl: string;
  onLeave: () => void;
  userType: 'doctor' | 'patient';
  appointmentId: string;
}

// Main VideoCall wrapper component
const VideoCall: React.FC<VideoCallProps> = ({ 
  roomUrl, 
  onLeave, 
  userType, 
  appointmentId 
}) => {
  const userName = userType === 'doctor' 
    ? 'Dr. ' + (localStorage.getItem('doctorName') ?? 'Unknown Doctor')
    : localStorage.getItem('patientName') ?? 'Unknown Patient';

  return (
    <DailyProvider
      url={roomUrl}
      userName={userName}
    >
      <CallInterface 
        onLeave={onLeave} 
        userType={userType} 
        appointmentId={appointmentId} 
      />
    </DailyProvider>
  );
};

// Call interface component that uses Daily React hooks
const CallInterface: React.FC<{
  onLeave: () => void;
  userType: 'doctor' | 'patient';
  appointmentId: string;
}> = ({ onLeave, userType, appointmentId }) => {
  const daily = useDaily();
  const participantIds = useParticipantIds();
  const localParticipant = useLocalParticipant();
  const [isJoining, setIsJoining] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [error, setError] = useState<string>('');

  // Join the call when component mounts
  useEffect(() => {
    if (!daily) return;

    const joinCall = async () => {
      try {
        setIsJoining(true);
        await daily.join();
      } catch (err) {
        console.error('Failed to join call:', err);
        setError('Failed to join video call');
      } finally {
        setIsJoining(false);
      }
    };

    joinCall();

    // Event listeners for call state changes[6]
    daily.on('joined-meeting', () => {
      console.log('Successfully joined meeting');
      setIsInCall(true);
    });

    daily.on('left-meeting', () => {
      console.log('Left meeting');
      setIsInCall(false);
      onLeave();
    });

    daily.on('error', (event) => {
      console.error('Daily call error:', event);
      setError('Video call error occurred');
    });

    return () => {
      if (daily) {
        daily.destroy();
      }
    };
  }, [daily, onLeave]);

  const endCall = async () => {
    if (daily) {
      await daily.leave();
      
      // Update appointment status if doctor is ending the call
      if (userType === 'doctor') {
        try {
          const token = localStorage.getItem('doctorToken');
          await fetch(`/api/appointments/${appointmentId}/status`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'completed' })
          });
        } catch (error) {
          console.error('Error updating appointment status:', error);
        }
      }
    }
  };

  if (error) {
    return (
      <div className="h-screen w-full bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">{error}</div>
          <button
            onClick={onLeave}
            className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (isJoining) {
    return (
      <div className="h-screen w-full bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <div className="text-white text-xl">Joining video call...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-gray-900 relative">
      {/* Audio component for hearing other participants */}
      <DailyAudio />
      
      {/* Call controls overlay */}
      <CallControls onEndCall={endCall} userType={userType} />
      
      {/* Participant count indicator */}
      <div className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 rounded-lg p-2">
        <div className="text-white text-sm">
          Participants: {participantIds.length + (localParticipant ? 1 : 0)}
        </div>
      </div>

      {/* Video grid */}
      <div className="h-full w-full grid grid-cols-1 md:grid-cols-2 gap-2 p-4">
        {/* Local participant */}
        {localParticipant && (
          <ParticipantTile 
            participantId="local" 
            isLocal={true}
          />
        )}
        
        {/* Remote participants */}
        {participantIds.map((id) => (
          <ParticipantTile 
            key={id} 
            participantId={id} 
            isLocal={false}
          />
        ))}
      </div>

      {/* Medical disclaimer for healthcare calls */}
      {userType === 'patient' && (
        <div className="absolute bottom-4 left-4 right-4 z-10 bg-blue-900 bg-opacity-80 rounded-lg p-3">
          <div className="text-white text-xs">
            <strong>Medical Consultation:</strong> This call may be recorded for medical records. 
            Please ensure you're in a private location for confidentiality.
          </div>
        </div>
      )}
    </div>
  );
};


 

const ParticipantTile: React.FC<{
  participantId: string;
  isLocal: boolean;
}> = ({ participantId, isLocal }) => {
  const participant = useParticipant(participantId);
  const videoTrack = useVideoTrack(participantId);
  const audioTrack = useAudioTrack(participantId);

  if (!participant) return null;

  return (
    <div className="relative bg-gray-800 rounded-lg overflow-hidden">
      {/* Corrected DailyVideo component */}
      <DailyVideo
        sessionId={participantId}
        mirror={isLocal}
        fit="cover"
        style={{ width: '100%', height: '100%' }}
        automirror={isLocal} // Automatically mirror local participant's camera
        type={'video'}      />
      
      {/* Audio component for remote participants */}
      {!isLocal && <DailyAudio sessionId={participantId} />}
      
      {/* Participant info overlay */}
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 rounded px-2 py-1">
        <span className="text-white text-sm">
          {participant.user_name || (isLocal ? 'You' : 'Guest')}
          {isLocal && ' (You)'}
        </span>
      </div>
      
      {/* Audio/Video status indicators */}
      <div className="absolute top-2 right-2 flex space-x-1">
        <span className={`text-xs px-1 rounded ${
          videoTrack?.state === 'playable' ? 'bg-green-600' : 'bg-red-600'
        } text-white`}>
          📹
        </span>
        <span className={`text-xs px-1 rounded ${
          audioTrack?.state === 'playable' ? 'bg-green-600' : 'bg-red-600'
        } text-white`}>
          🎤
        </span>
      </div>
    </div>
  );
};



// Call controls component
const CallControls: React.FC<{
  onEndCall: () => void;
  userType: 'doctor' | 'patient';
}> = ({ onEndCall, userType }) => {
  const daily = useDaily();
  const localVideoTrack = useVideoTrack('local');
  const localAudioTrack = useAudioTrack('local');

  const toggleCamera = () => {
    if (daily) {
      daily.setLocalVideo(!localVideoTrack?.isOff);
    }
  };

  const toggleMicrophone = () => {
    if (daily) {
      daily.setLocalAudio(!localAudioTrack?.isOff);
    }
  };

  const shareScreen = () => {
    if (daily) {
      daily.startScreenShare();
    }
  };

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 flex space-x-2 bg-black bg-opacity-50 rounded-lg p-2">
      <button
        onClick={toggleCamera}
        className={`px-4 py-2 rounded flex items-center space-x-2 ${
          localVideoTrack?.isOff ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
        } text-white`}
      >
        <span>📹</span>
        <span>{localVideoTrack?.isOff ? 'Turn On Camera' : 'Turn Off Camera'}</span>
      </button>
      
      <button
        onClick={toggleMicrophone}
        className={`px-4 py-2 rounded flex items-center space-x-2 ${
          localAudioTrack?.isOff ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
        } text-white`}
      >
        <span>🎤</span>
        <span>{localAudioTrack?.isOff ? 'Unmute' : 'Mute'}</span>
      </button>
      
      {userType === 'doctor' && (
        <button
          onClick={shareScreen}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center space-x-2"
        >
          <span>🖥️</span>
          <span>Share Screen</span>
        </button>
      )}
      
      <button
        onClick={onEndCall}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center space-x-2"
      >
        <span>📞</span>
        <span>End Call</span>
      </button>
    </div>
  );
};

export default VideoCall;
