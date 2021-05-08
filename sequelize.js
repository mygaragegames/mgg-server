const { Sequelize } = require('sequelize');
const chalk = require('chalk');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    logging: false
});

const UserModel = require('./models/user');
const GameModel = require('./models/game');
const GameScreenshotModel = require('./models/gameScreenshot');

const User = UserModel(sequelize, Sequelize);
const Game = GameModel(sequelize, Sequelize);
const GameScreenshot = GameScreenshotModel(sequelize, Sequelize);

User.hasMany(Game, { as: "games" });
Game.belongsTo(User, {
    foreignKey: "userId",
    as: "user"
});

Game.hasMany(GameScreenshot, { as: "screenshots" });
GameScreenshot.belongsTo(Game, {
    foreignKey: "gameId",
    as: "game"
})

sequelize.sync().then(() => {
    console.log(chalk.grey('Sequelize updated database.'));
});

module.exports = {
    User,
    Game,
    GameScreenshot
};