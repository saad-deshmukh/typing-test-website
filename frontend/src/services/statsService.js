import axios from "axios";
const API_BASE_URL = 'http://localhost:5000/api';

const statsService = {
  // Save game result to backend (requires authentication)
  saveGameResult: async (gameData) => {
    try {
      //  We send the request immediately. The cookie travels automatically.
      const response = await axios.post(
        `${API_BASE_URL}/stats/save`,
        gameData,
        {
          withCredentials: true, 
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      return response.data;

    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Authentication expired. Please login again.');
      }

      console.error('Error saving game result:', error);
      throw error;
    }
  },


  // Get user's profile and statistics
  getUserStats: async () => {
    try {
      // We let the backend decide if we are authenticated.
      const response = await axios.get(
        `${API_BASE_URL}/stats/profile`,
        {
          withCredentials: true, // Sends the cookie
          headers: {
          }
        }
      );

      return response.data;

    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Authentication expired. Please login again.');
      }

      console.error('Error fetching user stats:', error);
      throw error;
    }
  },

  getLeaderboard: async (timeframe = 'all', gameMode = 'all') => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/stats/leaderboard`,
        {
          params: {
            timeframe,
            gameMode
          },
          withCredentials: true, // Consistent CORS handling
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;

    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  }

};

export default statsService;