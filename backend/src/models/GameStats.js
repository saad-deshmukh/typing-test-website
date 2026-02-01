import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class GameStats extends Model {
    static associate(models) {
      // GameStats belongs to a User
      GameStats.belongsTo(models.User, { foreignKey: "userId", as: "user" });

      GameStats.belongsTo(models.Game, { foreignKey: "gameId", as: "game" });

      GameStats.belongsTo(models.Player, { foreignKey: "playerId", as: "playerEntry" });
    }
  }

  GameStats.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id"
      }
    },
    gameId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Games",
        key: "id"
      }
    },
    playerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Players",
        key: "id"
      }
    },
    wpm: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false
    },
    accuracy: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false
    },
    wordsTyped: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    timeTaken: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Time taken in seconds"
    },
    errorsMade: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    gameMode: {
      type: DataTypes.STRING(50),
      defaultValue: "standard",
      allowNull: false
    },
    textDifficulty: {
      type: DataTypes.STRING(20),
      defaultValue: "medium",
      allowNull: false
    },
    isMultiplayer: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    playedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: "GameStats",
    indexes: [
      {
        name: "idx_user_date",
        fields: ["userId", "playedAt"]
      },
      {
        name: "idx_user_wpm",
        fields: ["userId", "wpm"]
      },
      {
        name: "idx_game_mode",
        fields: ["gameMode", "playedAt"]
      }
    ]
  });

  return GameStats;
};
