const bcrypt = require('bcrypt');
const chalk = require('chalk');
const fs = require("fs");
const readChunk = require('read-chunk');
const imageType = require('image-type');
const uniqid = require('uniqid');
const path = require("path");
const { Game, GameComment, User } = require('../sequelize');

function getGameComments( searchOptions ) {
    return new Promise((resolve, reject) => {
        GameComment.findAll({ where: searchOptions }).then((gameCommentData) => {
            resolve(gameCommentData);
        });
    });
}
function getOneGameComment( searchOptions ) {
    return new Promise((resolve, reject) => {
        GameComment.findOne({ where: searchOptions, include: { model: User, as: "user" } }).then((gameCommentData) => {
            resolve(gameCommentData);
        }).catch((error) => {
            reject(error);
        });
    });
}

function createGameComment( game, user, text ) {
    return new Promise((resolve, reject) => {
        if(game === null || user === null) {
            reject(404);
            return;
        }

        let data = {
            gameId: game.id,
            text: text,
            userId: user.id
        };

        // Save database Entry
        GameComment.create(data).then((commentData) => {
            resolve(commentData);
        }).catch((error) => {
            reject(error);
        });
    });
}

function updateGameComment( gameComment, newData) {
    return new Promise((resolve, reject) => {
        gameComment.update( newData ).then((newGameComment) => {
            resolve(newGameComment);
        }).catch((error) => {
            reject(error);
        });
    });
}

function deleteGameComment( gameComment ) {
    return new Promise((resolve, reject) => {
        if(gameComment === null) {
            reject(404);
            return;
        }

        gameComment.destroy().then(() => {
            resolve();
        }).catch((error) => {
            reject(error);
        });
    });
}

module.exports = {
    getGameComments,
    getOneGameComment,
    createGameComment,
    updateGameComment,
    deleteGameComment
}