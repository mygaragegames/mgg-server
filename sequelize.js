const { Sequelize } = require('sequelize');
const chalk = require('chalk');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    logging: false
});

const UserModel = require('./models/user');
const UserRoleModel = require('./models/userRole');
const GameModel = require('./models/game');
const GameScreenshotModel = require('./models/gameScreenshot');
const GameCommentModel = require('./models/gameComment');
const GameChannelModel = require('./models/gameChannel');
const PlaylistModel = require('./models/playlist');

const User = UserModel(sequelize, Sequelize);
const UserRole = UserRoleModel(sequelize, Sequelize);
const Game = GameModel(sequelize, Sequelize);
const GameScreenshot = GameScreenshotModel(sequelize, Sequelize);
const GameComment = GameCommentModel(sequelize, Sequelize);
const GameChannel = GameChannelModel(sequelize, Sequelize);
const Playlist = PlaylistModel(sequelize, Sequelize);

const ROLES = ["user", "supporter", "moderator", "admin"];

// User -> Game Relation
User.hasMany(Game, { as: "games" });
Game.belongsTo(User, {
    foreignKey: "userId",
    as: "user"
});

// User -> UserRole Relation
User.belongsToMany(UserRole, {
    through: "user_roles",
    as: "roles",
    foreignKey: "user_id",
});
UserRole.belongsToMany(User, {
    through: "user_roles",
    as: "users",
    foreignKey: "userRole_id",
});

// Game -> GameScreenshot Relation
Game.hasMany(GameScreenshot, { as: "screenshots" });
GameScreenshot.belongsTo(Game, {
    foreignKey: "gameId",
    as: "game"
});

// Game -> GameComment Relation
Game.hasMany(GameComment, { as: "comments" });
GameComment.belongsTo(Game, {
    foreignKey: "gameId",
    as: "game"
});

// GameComment -> User Relation
User.hasMany(GameComment, { as: "comments" });
GameComment.belongsTo(User, {
    foreignKey: "userId",
    as: "user"
});

// Playlist -> User Relation
User.hasMany(Playlist, { as: "playlists" });
Playlist.belongsTo(User, {
    foreignKey: "userId",
    as: "user"
});

// Game -> GameChannel Relation
GameChannel.belongsToMany(Game, {
    through: "channel_games",
    as: "games",
    foreignKey: "channel_id",
});
Game.belongsToMany(GameChannel, {
    through: "channel_games",
    as: "channels",
    foreignKey: "game_id",
});

// Playlist -> Game Relation
Playlist.belongsToMany(Game, {
    through: "playlist_games",
    as: "games",
    foreignKey: "playlist_id",
});
Game.belongsToMany(Playlist, {
    through: "playlist_games",
    as: "playlists",
    foreignKey: "game_id",
});

function createRoles() {
    UserRole.create({
        id: 1,
        name: "user"
    });
    UserRole.create({
        id: 2,
        name: "supporter"
    });
    UserRole.create({
        id: 3,
        name: "moderator"
    });
    UserRole.create({
        id: 4,
        name: "admin"
    });

    console.log(chalk.cyan('[mgg-server] (Sequelize) Created roles.'));
}

function createChannels() {
    GameChannel.create({
        id: 1,
        title: "2D",
        description: "2D Games"
    });
    GameChannel.create({
        id: 2,
        title: "3D",
        description: "3D Games"
    });
    GameChannel.create({
        id: 3,
        title: "Topdown",
        description: "Topdown Games"
    });
    GameChannel.create({
        id: 4,
        title: "Sidescroller",
        description: "Sidescroller Games"
    });
    GameChannel.create({
        id: 5,
        title: "Third-Person",
        description: "Third-Person Games"
    });
    GameChannel.create({
        id: 6,
        title: "First-Person",
        description: "First-Person Games"
    });

    console.log(chalk.cyan('[mgg-server] (Sequelize) Created channels.'));
}

let forceReset = false;
sequelize.sync({ force: forceReset }).then(() => {
    console.log(chalk.grey('[mgg-server] (Sequelize) Updated database.'));
    if(forceReset) createRoles();
    if(forceReset) createChannels();
});

module.exports = {
    User,
    UserRole,
    Game,
    GameScreenshot,
    GameComment,
    GameChannel,
    Playlist,
    ROLES
};