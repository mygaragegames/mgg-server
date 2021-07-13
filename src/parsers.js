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
    // Allowed: az AZ 09 - _
    let usernameRegex = /^[\w-]{3,}$/g;

    return usernameRegex.test(unfilteredUsername);
}

function makeUsernameValid(unfilteredUsername) {
    // Allowed: az AZ 09 - _
    let usernameRegex = /[^\w-]*/g;

    return unfilteredUsername.replace(usernameRegex, '');
}

function isEmailValid(unfilteredEmail) {
    let emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/g;

    return emailRegex.test(unfilteredEmail);
}

function isCreatorIDValid(unfilteredCreatorID) {
    let creatorIDRegex = /^P-[a-zA-Z0-9]{3}-[a-zA-Z0-9]{3}-[a-zA-Z0-9]{3}$/g;

    if(unfilteredCreatorID === "") { return true; }

    return creatorIDRegex.test(unfilteredCreatorID);
}

function isGameIDRegexValid(gameID) {
    const gameIDRegex = /^G(-[0-9B-DF-HJ-NPRTV-Y]{3}){3}$/g;
    return gameIDRegex.test(gameID);
}

function toBytesInt32(num) {
    return new Uint8Array([
        (num & 0xFF000000) >> 24,
        (num & 0x00FF0000) >> 16,
        (num & 0x0000FF00) >> 8,
        (num & 0x000000FF)
    ]);
}

function isGameIDChecksumValid(gameID) {
    const charset = '0123456789BCDFGHJKLMNPRTVWXY';
    const magic = 0xDEAD9ED5;
    const accessKey = '97b08aad';
    const keyBytes = [...accessKey].map(value => value.charCodeAt(0));
    // get data id
    gameID = gameID.slice(1).replace(/-/g, '');
    const num = [...gameID].reduce(
        (dataID, char) => dataID * 28 + charset.indexOf(char), 0
    ) ^ magic;
    const dataID = toBytesInt32(num);
    // calculate checksum
    const key = keyBytes.reduce((key, value) => {
        key ^= value;
        key = (key << 4) | (key >> 4);
        key &= 0xFF;
        return key;
    }, 0);
    const checksum = dataID.reduce((checksum, value) => checksum ^ value, key);
    return checksum === 0;
}

function isGameIDValid(gameID) {
    if (gameID === '') { return true; }
    return isGameIDRegexValid(gameID) && isGameIDChecksumValid(gameID);
}

function isSocialDiscordValid(unfilteredDiscord) {
    let discordRegex = /^.{3,32}#[0-9]{4}$/g;

    if(unfilteredDiscord === "") { return true; }

    return discordRegex.test(unfilteredDiscord);
}

function isSocialYouTubeValid(unfilteredYouTube) {
    let youtubeRegex = /^(?:https|http)\:\/\/(?:[\w]+\.)?youtube\.com\/(?:c\/|channel\/|user\/)?([\w-]{1,})$/g;

    if(unfilteredYouTube === "") { return true; }

    return youtubeRegex.test(unfilteredYouTube);
}

// Source: https://stackoverflow.com/posts/9102270/revisions
function getYoutubeID(url) {
    var regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    var match = url.match(regExp);
    return (match && match[2].length == 11)? match[2] : undefined;
}

function parseUser(user) {
    user.password = undefined;
    user.email = undefined;
    user.loginDiscord = undefined;
    user.loginTwitter = undefined;
    user.loginGoogle = undefined;
    user.avatarFileName = parseAvatar(user.avatarFileName);

    return user;
}

function parseGameData(gamesData) {
    // Dirty hack to make the data editable
    gamesData = JSON.parse(JSON.stringify(gamesData));

    let filteredGames = [];
    gamesData.forEach((game) => {
        game.coverFileName = parseGameCover(game.coverFileName);

        // remove security related fields for return
        game.user = parseUser(game.user);

        filteredGames.push(game);
    });
    
    gamesData = filteredGames;

    return gamesData;
}

module.exports = {
    parseAvatar,
    parseGameScreenshot,
    parseGameCover,
    isUsernameValid,
    makeUsernameValid,
    isEmailValid,
    isCreatorIDValid,
    isGameIDValid,
    isSocialDiscordValid,
    isSocialYouTubeValid,
    getYoutubeID,
    parseUser,
    parseGameData
}
