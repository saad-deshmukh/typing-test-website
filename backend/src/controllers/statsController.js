import { User, GameStats, Game, Player, sequelize, Sequelize } from "../models/index.js";
const { Op } = Sequelize;

export const saveGameResult = async (req, res) => {
 // console.log("saveGameResults called");
  try {
    const { 
      wpm, 
      accuracy, 
      wordsTyped, 
      timeTaken, 
      errorsMade, 
      gameMode = 'standard',
      textDifficulty = 'medium',
      gameId = null,
      playerId = null 
    } = req.body;
    
    const userId = req.user.id;

    if (!wpm || !accuracy || !wordsTyped || !timeTaken || errorsMade === undefined) {
      return res.status(400).json({ error: 'Missing required game result fields' });
    }

    const gameStats = await GameStats.create({
      userId,
      gameId,
      playerId,
      wpm: parseFloat(wpm),
      accuracy: parseFloat(accuracy),
      wordsTyped: parseInt(wordsTyped),
      timeTaken: parseInt(timeTaken),
      errorsMade: parseInt(errorsMade),
      gameMode,
      textDifficulty,
      isMultiplayer: !!gameId,
      playedAt: new Date()
    });

    await updateUserStats(userId);

    res.status(201).json({
      message: 'Game result saved successfully',
      gameStats
    });
  } catch (error) {
    console.error('Error saving game result:', error);
    res.status(500).json({ error: 'Failed to save game result' });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: [
        'id', 'username', 'totalGames', 'totalWordsTyped',
        'bestWpm', 'averageWpm', 'bestAccuracy', 'averageAccuracy',
        'totalTimeTyped', 'profilePicture', 'createdAt'
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const recentGames = await GameStats.findAll({
      where: { userId },
      order: [['playedAt', 'DESC']],
      limit: 10,
      attributes: ['wpm', 'accuracy', 'wordsTyped', 'timeTaken', 'gameMode', 'playedAt', 'isMultiplayer']
    });

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const performanceHistory = await GameStats.findAll({
      where: { 
        userId,
        playedAt: { [Op.gte]: thirtyDaysAgo }
      },
      order: [['playedAt', 'ASC']],
      attributes: ['wpm', 'accuracy', 'playedAt']
    });

    res.json({
      user,
      recentGames,
      performanceHistory,
      totalGamesThisMonth: performanceHistory.length
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const { timeframe = 'all', gameMode = 'all' } = req.query;
    
    if (timeframe === 'all') {
      const leaderboard = await User.findAll({
        attributes: ['id', 'username', 'bestWpm', 'averageWpm', 'totalGames'],
        where: {
          totalGames: { [Op.gt]: 0 }
        },
        order: [['bestWpm', 'DESC']],
        limit: 100
      });
      
      return res.json(leaderboard);
    } else {
      let dateFilter = {};
      
      if (timeframe === 'week') {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        dateFilter.playedAt = { [Op.gte]: weekAgo };
      } else if (timeframe === 'month') {
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        dateFilter.playedAt = { [Op.gte]: monthAgo };
      }
      
      let whereClause = { ...dateFilter };
      if (gameMode !== 'all') {
        whereClause.gameMode = gameMode;
      }

      const leaderboard = await GameStats.findAll({
        attributes: [
          'userId',
          [sequelize.fn('MAX', sequelize.col('GameStats.wpm')), 'bestWpm'],
          [sequelize.fn('AVG', sequelize.col('GameStats.wpm')), 'averageWpm'],
          [sequelize.fn('COUNT', sequelize.col('GameStats.id')), 'gameCount']
        ],
        where: whereClause,
        group: ['GameStats.userId'],
        include: [{
          model: User,
          as: 'user',
          attributes: ['username']
        }],
        order: [[sequelize.fn('MAX', sequelize.col('GameStats.wpm')), 'DESC']],
        limit: 100
      });

      return res.json(leaderboard);
    }
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};

// Optimized Helper: Uses SQL Aggregates instead of RAM
async function updateUserStats(userId) {
  try {
    const result = await GameStats.findOne({
      where: { userId },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalGames'],
        [sequelize.fn('SUM', sequelize.col('wordsTyped')), 'totalWordsTyped'],
        [sequelize.fn('SUM', sequelize.col('timeTaken')), 'totalTimeTyped'],
        [sequelize.fn('MAX', sequelize.col('wpm')), 'bestWpm'],
        [sequelize.fn('AVG', sequelize.col('wpm')), 'averageWpm'],
        [sequelize.fn('MAX', sequelize.col('accuracy')), 'bestAccuracy'],
        [sequelize.fn('AVG', sequelize.col('accuracy')), 'averageAccuracy']
      ],
      raw: true
    });

    if (!result || result.totalGames == 0) return;

    await User.update({
      totalGames: parseInt(result.totalGames),
      totalWordsTyped: parseInt(result.totalWordsTyped || 0),
      totalTimeTyped: parseInt(result.totalTimeTyped || 0),
      bestWpm: parseFloat(result.bestWpm || 0).toFixed(2),
      averageWpm: parseFloat(result.averageWpm || 0).toFixed(2),
      bestAccuracy: parseFloat(result.bestAccuracy || 0).toFixed(2),
      averageAccuracy: parseFloat(result.averageAccuracy || 0).toFixed(2)
    }, {
      where: { id: userId }
    });

   // console.log(`Stats updated for user ${userId}`);
  } catch (error) {
    console.error('Error updating user stats:', error);
  }
}
