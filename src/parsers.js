const path = require('path');

function parseAvatar(avatarFileName) {
    if(avatarFileName) {
        return process.env.ASSET_BASE + "avatars/" + avatarFileName;
    } else {
        return process.env.ASSET_BASE + "defaultAvatar.png";
    }
}

function parseGameScreenshot(fileName) {
    if(fileName) {
        return process.env.ASSET_BASE + "gameScreenshots/" + fileName;
    } else {
        return process.env.ASSET_BASE + "defaultGameScreenshot.png";
    }
}

function parseGameCover(fileName) {
    if(fileName) {
        return process.env.ASSET_BASE + "gameCovers/" + fileName;
    } else {
        return process.env.ASSET_BASE + "defaultGameCover.png";
    }
}

module.exports = {
    parseAvatar,
    parseGameScreenshot,
    parseGameCover
}