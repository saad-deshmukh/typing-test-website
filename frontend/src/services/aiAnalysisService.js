import axios from 'axios';

class AIAnalysisService {
  async analyzePerformance(userStats) {
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/api/analyze-performance`,
      { userStats },
      {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true 
      }
    );

    const data = response.data;
    return data.analysis;
  }
}

export default new AIAnalysisService();