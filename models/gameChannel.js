module.exports = (sequelize, type) => {
    return sequelize.define('gameChannel', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: type.STRING,
            allowNull: false
        },
        description: {
            type: type.TEXT,
            allowNull: false
        },
    });
}