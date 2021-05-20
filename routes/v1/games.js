const express = require('express');
const router = express.Router();
const chalk = require('chalk');
const auth = require('../../middlewares/auth');
const { parseAvatar, parseGameScreenshot, parseGameCover } = require('../../src/parsers');
const { getAllGames, getOneGame, createGame, deleteGame, updateGame } = require('../../src/games');

router.route('/')
    .get(getAllHandler)
    .post(auth.verifyToken, postOneHandler);

router.route('/:gameid')
    .get(getOneHandler)
    .put(auth.verifyToken, putOneHandler)
    .delete(auth.verifyToken, deleteOneHandler);

async function getAllHandler(req, res) {
    console.log(chalk.grey("[mgg-server] (Games) Games->Get"));

    let games = await getAllGames();
    games.forEach((game) => {
        game.coverFileName = parseGameCover(game.coverFileName);

        // remove security related fields for return
        game.user.password = undefined;
        game.user.email = undefined;

        game.user.avatarFileName = parseAvatar(game.user.avatarFileName);
    
    });

    res.status(200).json(games);
}
async function getOneHandler(req, res) {
    console.log(chalk.grey("[mgg-server] (Games) Games->Get"));

    if(req.params.gameid == undefined) {
        res.status(400).json({name: "MISSING_FIELDS", text: "Required parameter: gameid"});
        return;
    }

    let gameData = await getOneGame({ id: parseInt(req.params.gameid) }).catch(() => { return null; });
    if(gameData === null) {
        res.status(404).json({name: "GAME_NOT_FOUND", text: `There is no game with the id ${req.params.gameid}`});
        return;
    }

    gameData.coverFileName = parseGameCover(gameData.coverFileName);

    gameData.comments.forEach((comment) => {
        // remove security related fields for return
        comment.user.password = undefined;
        comment.user.email = undefined;
        comment.user.avatarFileName = parseAvatar(comment.user.avatarFileName);
    });

    gameData.screenshots.forEach((gameScreenshot) => {
        gameScreenshot.fileName = parseGameScreenshot(gameScreenshot.fileName);
    });

    res.status(200).json(gameData);
}
async function postOneHandler(req, res) {
    console.log(chalk.grey("[mgg-server] (Games) Games->Post"));

    const data = {
        title: req.body.title,
        ingameID: req.body.ingameID,
        description: req.body.description,
        youtubeID: req.body.youtubeID,
        displayStatus: req.body.displayStatus,
        userId: req.user.id
    };

    if(data.title === '' || data.ingameID === '') {
        res.status(400).json({name: "MISSING_FIELDS", text: "Required fields: title, ingameID"});
        return;
    }

    createGame( data ).then((game) => {
        game.setChannels(req.body.channels);

        game.coverFileName = parseGameCover(game.coverFileName);

        res.status(201).json( game );
    }).catch((error) => {
        console.error(error);
        res.status(500).json({name: "UNKNOWN_SERVER_ERROR", text: "Unknown Server Error! Please try again later!"});
    });
}
async function putOneHandler(req, res) {
    console.log(chalk.grey("[mgg-server] (Games) Games->Put"));

    const data = {
        title: req.body.title,
        ingameID: req.body.ingameID,
        description: req.body.description,
        displayStatus: req.body.displayStatus,
    };

    let game = await getOneGame({ id: parseInt(req.params.gameid) }).catch(() => { return null; });
    if(game === null) {
        res.status(404).json({name: "GAME_NOT_FOUND", text: `There is no game with the id ${req.params.gameid}`});
        return;
    }

    // Check if user is owner or moderator/admin
    if(game.userId !== req.userId && !req.userRoles.includes('moderator', 'admin')) {
        res.status(403).json({name: "AUTHENTICATION_NEEDED", text: "You are not allowed to perform this action."});
        return;
    }

    game.setChannels(req.body.channels);
    updateGame( game, data ).then((data) => {
        res.status(201).json({name: "GAME_UPDATED", text: "Game was updated."});
        return;
    }).catch((error) => {
        res.status(500).json({name: "UNKNOWN_SERVER_ERROR", text: "Unknown Server Error! Please try again later!"});
    });
}
async function deleteOneHandler(req, res) {
    console.log(chalk.grey("[mgg-server] (Games) Games->Delete"));

    let game = await getOneGame({ id: parseInt(req.params.gameid) }).catch(() => { return null; });
    if(game === null) {
        res.status(404).json({name: "GAME_NOT_FOUND", text: `There is no game with the id ${req.params.gameid}`});
        return;
    }

    // Check if user is owner or moderator/admin
    if(game.userId !== req.userId && !req.userRoles.includes('moderator', 'admin')) {
        res.status(403).json({name: "AUTHENTICATION_NEEDED", text: "You are not allowed to perform this action."});
        return;
    }

    deleteGame( game ).then((data) => {
        res.status(200).json({name: "GAME_DELETED", text: "Game was deleted."});
        return;
    }).catch((error) => {
        res.status(500).json({name: "UNKNOWN_SERVER_ERROR", text: "Unknown Server Error! Please try again later!"});
    });
}

module.exports = router;