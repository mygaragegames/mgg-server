const express = require('express');
const multer = require('multer');
const router = express.Router();
const chalk = require('chalk');
const auth = require('../../middlewares/auth');
const { parseAvatar, parseGameScreenshot, parseGameCover, checkGameID } = require('../../src/parsers');
const { getAllGames, getOneGame, createGame, deleteGame, updateGame, saveGameCover, deleteGameCover } = require('../../src/games');

let upload = multer({ dest: '/tmp/'});

router.route('/')
    .get(getAllHandler)
    .post(auth.verifyToken, postOneHandler);

router.route('/:gameid')
    .get(getOneHandler)
    .put(auth.verifyToken, putOneHandler)
    .delete(auth.verifyToken, deleteOneHandler);

router.route('/:gameid/cover')
    .put(auth.verifyToken, upload.single('cover'), putOneCoverHandler)
    .delete(auth.verifyToken, deleteOneCoverHandler);

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

    // remove security related fields for return
    gameData.user.password = undefined;
    gameData.user.email = undefined;

    gameData.user.avatarFileName = parseAvatar(gameData.user.avatarFileName);

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

    let filteredDisplayStatus = 0;
    switch(req.body.displayStatus) {
        default:
        case 0:
            filteredDisplayStatus = 0;
            break;
        case 1:
            filteredDisplayStatus = 1;
            break;
        case 2:
            filteredDisplayStatus = 2;
            break;
    }

    const data = {
        title: req.body.title,
        ingameID: req.body.ingameID,
        description: req.body.description,
        displayStatus: filteredDisplayStatus,
        youtubeID: req.body.youtubeID,
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
        switch(error) {
            default:
                res.status(500).json({name: "UNKNOWN_ERROR", text: "Game could not be updated."});
                return;
            case 400:
                res.status(400).json({name: "GAME_GAMEID_WRONGFORMAT", text: "The ingame ID has the wrong format (G-000-000-000)."});
                return;
        }
    });
}
async function putOneHandler(req, res) {
    console.log(chalk.grey("[mgg-server] (Games) Games->Put"));

    const data = {
        title: req.body.title,
        ingameID: req.body.ingameID,
        description: req.body.description,
        displayStatus: req.body.displayStatus,
        youtubeID: req.body.youtubeID,
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

    if(req.body.channels != undefined) {
        game.setChannels(req.body.channels);
    }

    updateGame( game, data ).then((data) => {
        res.status(201).json({name: "GAME_UPDATED", text: "Game was updated."});
        return;
    }).catch((error) => {
        switch(error) {
            default:
                res.status(500).json({name: "UNKNOWN_ERROR", text: "Game could not be updated."});
                return;
            case 400:
                res.status(400).json({name: "GAME_INGAMEID_WRONGFORMAT", text: "The ingame ID has the wrong format (G-000-000-000)."});
                return;
        }
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

async function putOneCoverHandler(req, res) {
    console.log(chalk.grey("[mgg-server] (Games) Game->PutCover"));

    if(req.params.gameid === '' || req.file === undefined) {
        res.status(400).json({name: "MISSING_FIELDS", text: "Required fields: gameId, cover"});
        return;
    }

    // Find attached game
    let game = await getOneGame({ id: req.params.gameid }).catch(() => { return null; });
    if(game === null) {
        res.status(404).json({name: "GAME_NOT_FOUND", text: `There is no game with the id ${req.params.gameid}`});
        return;
    }

    if(game.userId !== req.userId && !req.userRoles.includes('moderator', 'admin')) {
        res.status(403).json({name: "AUTHENTICATION_NEEDED", text: "You are not allowed to perform this action."});
        return;
    }

    saveGameCover(game, req.file).then(() => {
        res.status(201).json({name: "GAME_COVER_UPDATED", text: "Cover of game was updated."});
        return;
    }).catch((error) => {
        switch(error) {
            default:
                res.status(500).json({name: "UNKNOWN_ERROR", text: "Cover could not be updated."});
                return;
            case 400:
                res.status(400).json({name: "GAME_COVER_WRONGFORMAT", text: "Your cover is not a png or jpg file."});
                return;
        }
    });
}
async function deleteOneCoverHandler(req, res) {
    console.log(chalk.grey("[mgg-server] (Games) Games->DeleteCover"));

    if(req.params.gameid === '') {
        res.status(400).json({name: "MISSING_FIELDS", text: "Required fields: gameId"});
        return;
    }

    // Find attached game
    let game = await getOneGame({ id: req.params.gameid }).catch(() => { return null; });
    if(game === null) {
        res.status(404).json({name: "GAME_NOT_FOUND", text: `There is no game with the id ${req.params.gameid}`});
        return;
    }

    if(game.userId !== req.userId && !req.userRoles.includes('moderator', 'admin')) {
        res.status(403).json({name: "AUTHENTICATION_NEEDED", text: "You are not allowed to perform this action."});
        return;
    }

    deleteGameCover( game ).then(() => {
        res.status(200).json({name: "GAME_COVER_UPDATED", text: "Cover of game was deleted."});
        return;
    }).catch((error) => {
        console.log(error);
        res.status(500).json({name: "UNKNOWN_ERROR", text: "Cover could not be deleted."});
        return;
    });
}

module.exports = router;