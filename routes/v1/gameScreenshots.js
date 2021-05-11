const express = require('express');
const multer = require('multer');
const router = express.Router();
const chalk = require('chalk');
const auth = require('../../middlewares/auth');
const { Game, GameScreenshot } = require('../../sequelize');
const { getOneGame } = require('../../src/games');
const { getGameScreenshots, getOneGameScreenshot, saveGameScreenshot, deleteGameScreenshot } = require('../../src/gameScreenshots');
const game = require('../../models/game');

let upload = multer({ dest: '/tmp/'});

router.route('/:gameid')
    .post(auth.verifyToken, upload.array('screenshots'), postOneHandler)
    .delete(auth.verifyToken, deleteOneHandler);

async function postOneHandler(req, res) {
    console.log(chalk.grey("[mgg-server] (GameScreenshots) GameScreenshots->Post"));

    if(req.params.gameid === '' || req.files.length < 1) {
        res.status(400).json({name: "MISSING_FIELDS", text: "Required fields: gameId, screenshots"});
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

    saveGameScreenshot(game, req.files).then(() => {
        res.status(201).json({name: "GAMESCREENSHOTS_UPLOADED", text: "Screenshots were uploaded"});
        return;
    }).catch(() => {
        res.status(500).json({name: "UNKNOWN_ERROR", text: "Screenshots could not be uploaded."});
        return;
    });
}
async function deleteOneHandler(req, res) {
    console.log(chalk.grey("[mgg-server] (GameScreenshots) GameScreenshots->Delete"));

    if(req.params.gameid === '') {
        res.status(400).json({name: "MISSING_FIELDS", text: "Required fields: gameId"});
        return;
    }

    // Find attached game screenshot
    let gameScreenshot = await getOneGameScreenshot({ id: req.params.gameid }).catch(() => { return null; });
    if(gameScreenshot === null) {
        res.status(404).json({name: "GAMESCREENSHOT_NOT_FOUND", text: "Screenshot could not be found."});
        return;
    }

    // Find attached game
    let game = await getOneGame({ id: gameScreenshot.gameId }).catch(() => { return null; });
    if(game === null) {
        res.status(404).json({name: "GAME_NOT_FOUND", text: `There is no game with the id ${req.params.gameid}`});
        return;
    }

    if(game.userId !== req.userId && !req.userRoles.includes('moderator', 'admin')) {
        res.status(403).json({name: "AUTHENTICATION_NEEDED", text: "You are not allowed to perform this action."});
        return;
    }

    deleteGameScreenshot( gameScreenshot ).then(() => {
        res.status(200).json({name: "GAMESCREENSHOTS_DELETED", text: "Screenshot was deleted"});
        return;
    }).catch((error) => {
        if(error === 404) {
            res.status(404).json({name: "GAMESCREENSHOT_NOT_FOUND", text: "Screenshot could not be found."});
            return;
        } else {
            console.log(error);
            res.status(500).json({name: "UNKNOWN_ERROR", text: "Screenshot could not be deleted."});
            return;
        }
    });
}

module.exports = router;