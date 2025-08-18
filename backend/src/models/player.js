// backend/models/player.js
module.exports = (sequelize, DataTypes) => {
  const Player = sequelize.define("Player", {
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    speed: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    accuracy: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    time: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    }
  });

  Player.associate = (models) => {
    Player.belongsTo(models.Game, { foreignKey: "gameId", as: "game" });
  };

  return Player;
};
