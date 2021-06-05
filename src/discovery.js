const bcrypt = require('bcrypt');
const chalk = require('chalk');
const { Game, User } = require('../sequelize');

function getNewestGames() {
    return new Promise((resolve, reject) => {
        Game.findAll({
            include: { model: User, as: "user" },
            order: [
                ['createdAt', 'DESC']
            ]
        }).then((games) => {
            resolve(games);
        });
    });
}

module.exports = {
    getNewestGames
}