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

function isUsernameValid(unfilteredUsername) {
    let usernameRegex = /^[a-zA-Z0-9-_]*$/g;

    return usernameRegex.test(unfilteredUsername);
}

function isCreatorIDValid(unfilteredCreatorID) {
    let creatorIDRegex = /^P-[a-zA-Z0-9]{3}-[a-zA-Z0-9]{3}-[a-zA-Z0-9]{3}$/g;

    return creatorIDRegex.test(unfilteredCreatorID);
}

function isGameIDValid(unfilteredGameID) {
    let gameIDRegex = /^G-[a-zA-Z0-9]{3}-[a-zA-Z0-9]{3}-[a-zA-Z0-9]{3}$/g;

    return gameIDRegex.test(unfilteredGameID);
}

module.exports = {
    parseAvatar,
    parseGameScreenshot,
    parseGameCover,
    isUsernameValid,
    isCreatorIDValid,
    isGameIDValid
}