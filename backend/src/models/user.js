import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // User can participate in many games through Player
      User.hasMany(models.Player, { foreignKey: "userId", as: "playerEntries" });

      // User has many game statistics records
      User.hasMany(models.GameStats, { foreignKey: "userId", as: "gameStats" });
    }
  }

  User.init({
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    totalGames: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    totalWordsTyped: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    bestWpm: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00,
      allowNull: false
    },
    averageWpm: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00,
      allowNull: false
    },
    bestAccuracy: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00,
      allowNull: false
    },
    averageAccuracy: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00,
      allowNull: false
    },
    totalTimeTyped: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      comment: "Total time typed in seconds"
    },
    profilePicture: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: "User",
  });

  return User;
};
