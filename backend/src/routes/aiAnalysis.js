import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/analyze-performance", async (req, res) => {
  try {
    // console.log("AI analysis request received");

    const { userStats } = req.body;

    if (!userStats || !userStats.user) {
      return res.status(400).json({ error: "Invalid user statistics data provided" });
    }

    const userData = userStats.user;
    const safeUserData = {
      username: userData.username || "Unknown User",
      totalGames: userData.totalGames || 0,
      bestWpm: parseFloat(userData.bestWpm) || 0,
      averageWpm: parseFloat(userData.averageWpm) || 0,
      bestAccuracy: parseFloat(userData.bestAccuracy) || 0,
      averageAccuracy: parseFloat(userData.averageAccuracy) || 0,
      totalWordsTyped: userData.totalWordsTyped || 0,
      totalTimeTyped: userData.totalTimeTyped || 0,
    };

const prompt = `You are a professional typing coach analyzing user performance data.

User Profile:
- Name: ${safeUserData.username}
- Total Games: ${safeUserData.totalGames}
- Best Speed: ${safeUserData.bestWpm} WPM
- Average Speed: ${safeUserData.averageWpm} WPM  
- Best Accuracy: ${safeUserData.bestAccuracy}%
- Average Accuracy: ${safeUserData.averageAccuracy}%
- Total Words Typed: ${safeUserData.totalWordsTyped}
- Practice Time: ${Math.round(safeUserData.totalTimeTyped / 60)} minutes

Provide a concise and logically structured typing performance analysis with the following sections:

Current Skill Level Assessment  
Classify the skill level clearly and justify it using the provided statistics.

Key Strengths  
Mention only the most impactful strengths based strictly on data.

Areas for Improvement  
Identify the most critical weaknesses affecting performance.

Personalized Recommendations  
Provide 3–4 precise, actionable, and practical improvement steps tailored to the user's level.

Goal Setting  
Define realistic short-term and medium-term goals using measurable metrics.

Keep the response highly focused, data-driven, and under 350 words. Avoid unnecessary explanation or repetition.`;


   // console.log(" Calling Gemini API with prompt...");
   //  console.log(" Prompt length:", prompt.length);

    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent",
      {
        contents: [{ parts: [{ text: prompt }] }]
      },
      {
        headers: { "Content-Type": "application/json" },
        params: {
          key: process.env.GOOGLE_GEMINI_API_KEY
        }
      }
    );

    const data = response.data;

    const analysis =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!analysis || analysis.length === 0) {
      return res.status(200).json({
        analysis: null,
        success: false,
        message: "AI model returned an empty response. Try again later."
      });
    }

    res.status(200).json({
      analysis,
      success: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Backend AI Analysis Error:", error.response?.data || error.message);

    res.status(500).json({
      error: "Failed to analyze performance",
      success: false,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
