const bcrypt = require('bcrypt');
const chalk = require('chalk');
const fs = require("fs");
const readChunk = require('read-chunk');
const imageType = require('image-type');
const uniqid = require('uniqid');
const path = require("path");
const { Game, GameScreenshot } = require('../sequelize');

function getGameScreenshots( searchOptions ) {
    return new Promise((resolve, reject) => {
        GameScreenshot.findAll({ where: searchOptions }).then((gameScreenshotData) => {
            resolve(gameScreenshotData);
        });
    });
}
function getOneGameScreenshot( searchOptions ) {
    return new Promise((resolve, reject) => {
        GameScreenshot.findOne({ where: searchOptions }).then((gameScreenshotData) => {
            resolve(gameScreenshotData);
        }).catch((error) => {
            reject(error);
        });
    });
}

function saveGameScreenshot( game, files ) {
    return new Promise((resolve, reject) => {
        files.forEach((screenshotFile) => {
            // Filetype Check
            let screenshotImageBuffer = readChunk.sync(screenshotFile.path, 0, 12);
            let screenshotImageType = imageType(screenshotImageBuffer);
    
            // Ignore non-images
            if(screenshotImageType === null) {
                reject(400);
                return;
            }
    
            // Only allow PNG & JPG images
            if(screenshotImageType.mime !== "image/jpeg" && screenshotImageType.mime !== "image/png") {
                reject(400);
                return;
            }
    
            let newImageName = uniqid() + "." + screenshotImageType.ext;
            let newImagePath = path.join(`./public/gameScreenshots/${newImageName}`);
            fs.renameSync(screenshotFile.path, newImagePath);
    
            let data = {
                gameId: game.id,
                fileName: newImageName
            };
    
            // TODO: Minimize images
    
            // Save database Entries
            GameScreenshot.create(data).catch((error) => {
                fs.unlinkSync(newImagePath);
                reject(error);
            });
        });
        
        resolve();
    });
}

function deleteGameScreenshot( gameScreenshot ) {
    return new Promise((resolve, reject) => {
        if(gameScreenshot === null) {
            reject(404);
            return;
        }

        let imagePath = path.join(`./public/gameScreenshots/${gameScreenshot.fileName}`);
        
        // remove physical file
        try {
            fs.unlinkSync(imagePath);
        } catch(error) {}

        gameScreenshot.destroy().then(() => {
            resolve();
        }).catch((error) => {
            reject(error);
        });
    });
}

module.exports = {
    getGameScreenshots,
    getOneGameScreenshot,
    saveGameScreenshot,
    deleteGameScreenshot
}