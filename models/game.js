module.exports = (sequelize, type) => {
    return sequelize.define('game', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: type.STRING,
            allowNull: false
        },
        ingameID: {
            type: type.STRING,
            allowNull: false
        },
        description: type.TEXT,
        coverFileName: type.STRING,
        youtubeID: type.STRING,
        displayStatus: type.INTEGER,
        views: type.INTEGER,
        isInQueue: {
            type: type.BOOLEAN,
            defaultValue: true,
        },
        themeFont: type.INTEGER,
        themeColor: type.STRING,
    });
}