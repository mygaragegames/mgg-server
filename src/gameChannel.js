const chalk = require('chalk');
const { Sequelize } = require('sequelize');
const { Game, GameChannel, User } = require('../sequelize');

function getGameChannels( searchOptions ) {
    return new Promise((resolve, reject) => {
        GameChannel.findAll({ where: searchOptions }).then((gameChannelData) => {
            resolve(gameChannelData);
        });
    });
}

function getOneGameChannel( searchOptions, userId = 0, userRoles = []) {
    let overrideDisplayStatus = ['moderator', 'admin'].some(str => userRoles.includes(str));

    return new Promise((resolve, reject) => {
        GameChannel.findOne({
            where: searchOptions,
            include: {
                model: Game,
                as: "games",
                include: { model: User, as: "user" },
                required: false,
                where: {
                    [Sequelize.Op.and]: [
                        Sequelize.literal(`1 = CASE
                            WHEN ${overrideDisplayStatus} = true THEN 1
                            WHEN games.displayStatus = 2 AND games.userId = ${userId} THEN 1
                            WHEN games.displayStatus = 0 THEN 1
                            ELSE 2
                        END`)
                    ]
                },
                order: [
                    ['games.views', 'DESC']
                ],
            }
        }).then((gameChannelData) => {
            resolve(gameChannelData);
        }).catch((error) => {
            reject(error);
        });
    });
}

function createGameChannel( title, description ) {
    return new Promise((resolve, reject) => {
        let data = {
            title: title,
            description: description,
        };

        // Save database Entry
        GameChannel.create(data).then((gameChannelData) => {
            resolve(gameChannelData);
        }).catch((error) => {
            reject(error);
        });
    });
}

function updateGameChannel( gameChannel, newData) {
    return new Promise((resolve, reject) => {
        gameChannel.update( newData ).then((newGameChannel) => {
            resolve(newGameChannel);
        }).catch((error) => {
            reject(error);
        });
    });
}

function deleteGameChannel( gameChannel ) {
    return new Promise((resolve, reject) => {
        if(gameChannel === null) {
            reject(404);
            return;
        }

        gameChannel.destroy().then(() => {
            resolve();
        }).catch((error) => {
            reject(error);
        });
    });
}

module.exports = {
    getGameChannels,
    getOneGameChannel,
    createGameChannel,
    updateGameChannel,
    deleteGameChannel
}