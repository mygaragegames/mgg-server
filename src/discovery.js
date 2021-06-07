const bcrypt = require('bcrypt');
const chalk = require('chalk');
const { Sequelize } = require('sequelize');
const { Game, User } = require('../sequelize');

function getNewestGames(userId = 0, userRoles = []) {
    let overrideDisplayStatus = userRoles.includes('moderator', 'admin');

    return new Promise((resolve, reject) => {
        Game.findAll({
            include: { model: User, as: "user" },
            where: {
                [Sequelize.Op.and]: [
                    Sequelize.literal(`1 = CASE
                        WHEN ${overrideDisplayStatus} = true THEN 1
                        WHEN displayStatus = 2 AND userId = ${userId} THEN 1
                        WHEN displayStatus = 0 THEN 1
                        ELSE 2
                    END`)
                ]
            },
            order: [
                ['createdAt', 'DESC']
            ],
            limit: 12
        }).then((games) => {
            resolve(games);
        });
    });
}

function getPopularGames(userId = 0, userRoles = []) {
    let overrideDisplayStatus = userRoles.includes('moderator', 'admin');

    return new Promise((resolve, reject) => {
        Game.findAll({
            include: { model: User, as: "user" },
            where: {
                [Sequelize.Op.and]: [
                    Sequelize.literal(`1 = CASE
                        WHEN ${overrideDisplayStatus} = true THEN 1
                        WHEN displayStatus = 2 AND userId = ${userId} THEN 1
                        WHEN displayStatus = 0 THEN 1
                        ELSE 2
                    END`)
                ]
            },
            order: [
                ['views', 'DESC']
            ],
            limit: 12
        }).then((games) => {
            resolve(games);
        });
    });
}

function getQueryGames(searchQuery, userId, userRoles) {
    let overrideDisplayStatus = userRoles.includes('moderator', 'admin');

    return new Promise((resolve, reject) => {
        Game.findAll({
            include: { model: User, as: "user" },
            where: {
                [Sequelize.Op.or]: {
                    title: { [Sequelize.Op.substring]: searchQuery },
                    ingameID: { [Sequelize.Op.substring]: searchQuery },
                    description: { [Sequelize.Op.substring]: searchQuery },
                    '$user.username$': { [Sequelize.Op.substring]: searchQuery }
                },
                [Sequelize.Op.and]: [
                    Sequelize.literal(`1 = CASE
                                                WHEN ${overrideDisplayStatus} = true THEN 1
                                                WHEN displayStatus = 2 AND userId = ${userId} THEN 1
                                                WHEN displayStatus = 0 THEN 1
                                                ELSE 2
                                           END`)
                ]
            },
            order: [
                ['createdAt', 'DESC']
            ],
            limit: 12
        }).then((games) => {
            resolve(games);
        });
    });
}

module.exports = {
    getNewestGames,
    getPopularGames,
    getQueryGames
}