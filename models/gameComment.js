module.exports = (sequelize, type) => {
    return sequelize.define('gameComment', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        text: {
            type: type.TEXT,
            allowNull: false
        },
    });
}