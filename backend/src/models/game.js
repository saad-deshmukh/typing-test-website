export default (sequelize, DataTypes) => {
  const Game = sequelize.define("Game", {
    roomToken: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    status: {
      type: DataTypes.ENUM("waiting", "in-progress", "finished"),
      defaultValue: "waiting"
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: true
    }
  });

  Game.associate = (models) => {
    Game.hasMany(models.Player, { foreignKey: "gameId", as: "players" });
    Game.hasMany(models.GameStats, { foreignKey: "gameId", as: "gameStats" });
  };

  return Game;
};
