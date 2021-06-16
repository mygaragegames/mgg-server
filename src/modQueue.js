const express = require('express');
const router = express.Router();
const chalk = require('chalk');
const { Game, User } = require('../sequelize');
const { updateGame } = require('./games');

function getQueueGames() {
    return new Promise((resolve, reject) => {
        Game.findAll({
            include: { model: User, as: "user" },
            where: {
                displayStatus: 0,
                isInQueue: true
            },
            order: [
                ['views', 'DESC']
            ]
        }).then((games) => {
            resolve(games);
        });
    });
}

function deleteFromQueue(game) {
    return new Promise((resolve, reject) => {
        updateGame( game, {
            isInQueue: false
        }).then(() => {
            resolve(201);
            return;
        }).catch((error) => {
            reject(error);
        });
    });
}

module.exports = {
    getQueueGames,
    deleteFromQueue
}