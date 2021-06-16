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

function isGameIDValid(unfilteredGameID) {
    let gameIDRegex = /^G-[a-zA-Z0-9]{3}-[a-zA-Z0-9]{3}-[a-zA-Z0-9]{3}$/g;

    if(unfilteredGameID === "") { return true; }

    return gameIDRegex.test(unfilteredGameID);
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