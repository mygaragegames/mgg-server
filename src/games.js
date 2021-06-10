const bcrypt = require('bcrypt');
const chalk = require('chalk');
const fs = require("fs");
const readChunk = require('read-chunk');
const imageType = require('image-type');
const uniqid = require('uniqid');
const path = require("path");
const { Game, User, GameScreenshot, GameComment, GameChannel } = require('../sequelize');
const { isGameIDValid } = require('./parsers');
const { deleteGameScreenshot } = require('./gameScreenshots');
const { deleteGameComment } = require('./gameComments');

function getAllGames() {
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

function getOneGame( searchOptions ) {
    return new Promise((resolve, reject) => {
        Game.findOne({ where: searchOptions, include: [
            { model: GameScreenshot, as: "screenshots" },
            { model: User, as: "user" },
            { model: GameChannel, as: "channels" },
            { model: GameComment, as: "comments", include: { model: User, as: "user" } }
        ]}).then((gameData) => {
            if(gameData === null) {
                reject(404);
                return;
            }

            gameData.update({
                views: gameData.views + 1
            }).then(() => {
                resolve(gameData);
            }).catch((error) => {
                resolve(gameData);
            });
        });
    });
}

function createGame( data ) {
    return new Promise((resolve, reject) => {
        if(!isGameIDValid(data.ingameID)) {
            reject(400);
            return;
        }

        Game.create(data).then((gameData) => {
            resolve(gameData);
        }).catch(function(error) {
            reject(error);
        });
    });
}

function updateGame( game, newData ) {
    return new Promise((resolve, reject) => {
        newData.coverFileName = undefined;

        if(newData.ingameID != undefined && !isGameIDValid(newData.ingameID)) {
            reject(400);
            return;
        }

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

        // Remove Cover
        deleteGameCover(game);

        // Remove Comments
        game.comments.forEach((gameComment) => {
            deleteGameComment(gameComment);
        });

        game.destroy().then(() => {
            resolve();
        }).catch((error) => {
            reject(error);
        });
    });
}

function saveGameCover( game, coverFile ) {
    return new Promise((resolve, reject) => {
        if(game === null){
            reject(404);
            return;
        }

        // Remove previous covers if existing
        if(game.coverFileName !== null) {
            let imagePath = path.join(`./public/gameCovers/${game.coverFileName}`);
            try {
                fs.unlinkSync(imagePath);
            } catch(error) {}
            game.coverFileName = null;
        }

        // Filetype Check
        let coverImageBuffer = readChunk.sync(coverFile.path, 0, 12);
        let coverImageType = imageType(coverImageBuffer);

        // Ignore non-images
        if(coverImageType === null) {
            reject(400);
            return;
        }

        // Only allow PNG & JPG images
        if(coverImageType.mime !== "image/jpeg" && coverImageType.mime !== "image/png") {
            reject(400);
            return;
        }

        let newImageName = uniqid() + "." + coverImageType.ext;
        let newImagePath = path.join(`./public/gameCovers/${newImageName}`);
        fs.renameSync(coverFile.path, newImagePath);

        game.update({
            coverFileName: newImageName
        }).then(() => {
            resolve();
        }).catch((error) => {
            fs.unlinkSync(newImagePath);
            reject(error);
        });
    });
}

function deleteGameCover( game ) {
    return new Promise((resolve, reject) => {
        if(game === null) {
            reject(404);
            return;
        }

        let imagePath = path.join(`./public/gameCovers/${game.coverFileName}`);
        
        // remove physical file
        try {
            fs.unlinkSync(imagePath);
        } catch(error) {}

        game.update({ coverFileName: null }).then(() => {
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
    deleteGame,
    saveGameCover,
    deleteGameCover
}