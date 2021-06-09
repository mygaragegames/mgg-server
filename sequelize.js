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
    let channels = [{
        title: "2D",
        description: "For games in the second dimension."
    }, {
        title: "3D",
        description: "For games in the third dimension."
    }, {
        title: "Topdown",
        description: "For games that have a topdown camera perspective."
    }, {
        title: "Sidescroller",
        description: "For games that have a sidescroller camera perspective."
    }, {
        title: "Third-person",
        description: "For games that have a third-person camera perspective."
    }, {
        title: "First-person",
        description: "For games that have a first-person camera perspective."
    }, {
        title: "Parody",
        description: "This game is a parody of an existing game."
    }, {
        title: "Music",
        description: "These games have a heavy focus on music experiences."
    }, {
        title: "Story",
        description: "These games have a heavy focus on story and narrative."
    }, {
        title: "Non-interactive",
        description: "An experience that doesn't require any inputs by the player and instead plays on its own."
    }, {
        title: "Endless",
        description: "These games don't stop but continue and continue and continue and cont-."
    }, {
        title: "Time",
        description: "These games have a heavy focus on time or have elements of time pressure."
    }, {
        title: "Casual",
        description: "These games can be played by anyone, don't be shy, give 'em a try!"
    }, {
        title: "Motion-Control",
        description: "These games utilize the consoles motion control capabilities."
    }, {
        title: "IR-Control",
        description: "These games utilize the consoles infrared sensor capabilities."
    }, {
        title: "Puzzle",
        description: "For games in the puzzle genre."
    }, {
        title: "Action",
        description: "For games in the action genre."
    }, {
        title: "Racing",
        description: "For games in the racing genre."
    }, {
        title: "Rhythm",
        description: "For games in the rhythm genre."
    }, {
        title: "Shooter",
        description: "For games in the shooter genre."
    }, {
        title: "Point-And-Click",
        description: "For games in the point-and-click genre."
    }, {
        title: "Utility-And-Tools",
        description: "These entries are not games but useful utilities and/or tools."
    }, {
        title: "Templates-And-Assets",
        description: "These entries are not games but code snippets, tutorials and templates for other creators."
    }];

    channels.forEach((channel) => {
        GameChannel.create({
            title: channel.title,
            description: channel.description
        });
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