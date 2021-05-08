module.exports = (sequelize, type) => {
    return sequelize.define('gameScreenshot', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        fileName: {
            type: type.STRING,
            allowNull: false
        },
    });
}