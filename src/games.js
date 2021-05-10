const bcrypt = require('bcrypt');
const chalk = require('chalk');
const { Game, User, GameScreenshot, GameComment } = require('../sequelize');
const { deleteGameScreenshot } = require('./gameScreenshots');

function getAllGames() {
    return new Promise((resolve, reject) => {
        Game.findAll({ include: { model: User, as: "user" } }).then((games) => {
            resolve(games);
        });
    });
}

function getOneGame( searchOptions ) {
    return new Promise((resolve, reject) => {
        Game.findOne({ where: searchOptions, include: [
            { model: GameScreenshot, as: "screenshots" },
            { model: User, as: "user" },
            { model: GameComment, as: "comments", include: { model: User, as: "user" } }]}).then((gameData) => {
            resolve(gameData);
        });
    });
}

function createGame( data ) {
    return new Promise((resolve, reject) => {
        Game.create(data).then((gameData) => {
            resolve(gameData);
        }).catch(function(error) {
            reject(error);
        });
    });
}

function updateGame( game, newData ) {
    return new Promise((resolve, reject) => {
        game.update( newData ).then((newGame) => {
            resolve(newGame);
        }).catch((error) => {
            reject(error);
        });
    });
}

function deleteGame( game ) {
    return new Promise((resolve, reject) => {
        // Remove Screenshots
        game.screenshots.forEach((gameScreenshot) => {
            deleteGameScreenshot(gameScreenshot);
        });

        // TODO: Remove Playlist Entries

        // TODO: Remove Comments

        game.destroy().then(() => {
            resolve();
        }).catch((error) => {
            reject(error);
        });
    });
}

module.exports = {
    createGame,
    getAllGames,
    getOneGame,
    updateGame,
    deleteGame
}