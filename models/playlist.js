module.exports = (sequelize, type) => {
    return sequelize.define('playlist', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: type.STRING,
            allowNull: false
        },
        isBookmark: type.BOOLEAN,
    });
}