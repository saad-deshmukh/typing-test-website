export default (sequelize, DataTypes) => {
  const Player = sequelize.define("Player", {
    speed: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    accuracy: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    time: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    isHost: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  });

  Player.associate = (models) => {
    Player.belongsTo(models.Game, { foreignKey: "gameId" });
    Player.belongsTo(models.User, { foreignKey: "userId" });
    // Player can have game statistics record
    Player.hasOne(models.GameStats, { foreignKey: "playerId", as: "gameStats" });
  };

  return Player;
};
