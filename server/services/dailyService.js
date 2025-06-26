import fetch from 'node-fetch';

class DailyService {
  constructor() {
    this.apiKey = process.env.DAILY_API_KEY;
    this.baseUrl = 'https://api.daily.co/v1';
    
    if (!this.apiKey) {
      console.error('❌ DAILY_API_KEY not found in environment variables');
    }
  }

  async createRoom(appointmentId, scheduledDate, duration) {
    try {
      const roomName = `medtour-${appointmentId}-${Date.now()}`;
      
      // Calculate expiration time (scheduled time + duration)
      const expirationTime = new Date(scheduledDate.getTime() + duration * 60 * 1000);
      
      const response = await fetch(`${this.baseUrl}/rooms`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: roomName,
          properties: {
            // Use 'nbf' instead of 'start_time' - this is the correct property name
            nbf: Math.floor(scheduledDate.getTime() / 1000),
            // Use 'exp' for expiration - this is correct
            exp: Math.floor(expirationTime.getTime() / 1000),
            max_participants: 2,
            enable_screenshare: true,
            enable_chat: true
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Daily.co API error response:', errorData);
        throw new Error(`Daily.co API error: ${response.status} - ${errorData}`);
      }

      const roomData = await response.json();
      console.log('✅ Daily.co room created successfully:', roomData.name);
      
      return {
        roomUrl: roomData.url,
        roomName: roomData.name
      };
      
    } catch (error) {
      console.error('❌ Daily.co service error:', error);
      throw new Error(`Failed to create video call room: ${error.message}`);
    }
  }
}

export default new DailyService();