const bcrypt = require('bcrypt');
const chalk = require('chalk');
const { Game } = require('../sequelize');

function getAllGames() {
    return new Promise((resolve, reject) => {
        Game.findAll().then((games) => {
            resolve(games);
        });
    });
}

function getOneGame( searchOptions ) {
    return new Promise((resolve, reject) => {
        Game.findOne({ where: searchOptions}).then((gameData) => {
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

function updateGame( gameID, data ) {
    return new Promise((resolve, reject) => {
        resolve();
    });
}

function deleteGame( gameID ) {
    return new Promise((resolve, reject) => {
        resolve();
    });
}

module.exports = {
    createGame,
    getAllGames,
    getOneGame,
    updateGame,
    deleteGame
}