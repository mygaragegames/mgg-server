const path = require('path');

function parseAvatar(avatarFileName) {
    if(avatarFileName) {
        return path.join(process.env.ASSET_BASE, "avatars", avatarFileName);
    } else {
        return path.join(process.env.ASSET_BASE, "defaultAvatar.png");
    }
}

function parseGameScreenshot(fileName) {
    if(fileName) {
        return path.join(process.env.ASSET_BASE, "gameScreenshots", fileName);
    } else {
        return path.join(process.env.ASSET_BASE, "defaultGameScreenshot.png");
    }
}

module.exports = {
    parseAvatar,
    parseGameScreenshot
}