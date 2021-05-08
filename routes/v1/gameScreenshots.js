const express = require('express');
const multer = require('multer');
const router = express.Router();
const chalk = require('chalk');

const { Game, GameScreenshot } = require('../../sequelize');
const { getOneGame } = require('../../src/games');
const { getGameScreenshots, saveGameScreenshot, deleteGameScreenshot } = require('../../src/gameScreenshots');

let upload = multer({ dest: '/tmp/'});

router.route('/:gameid')
    .post(upload.array('screenshots'), postOneHandler)
    .delete(deleteOneHandler);

async function postOneHandler(req, res) {
    console.log(chalk.grey("[mgg-server] GameScreenshots->Post"));

    if(req.params.gameid === '' || req.files.length < 1) {
        res.status(400).json({name: "MISSING_FIELDS", text: "Required fields: gameId, screenshots"});
        return;
    }

    // Find attached game
    let game = await getOneGame({ id: req.params.gameid });
    if(game === null) {
        res.status(404).json({name: "GAME_NOT_FOUND", text: "There is no game with the id " + req.params.gameid});
        return;
    }

    // TODO: Check for Authentication and if user has access to game

    saveGameScreenshot(game, req.files).then(() => {
        res.status(201).json({name: "GAMESCREENSHOTS_UPLOADED", text: "Screenshots were uploaded"});
        return;
    }).catch(() => {
        res.status(500).json({name: "UNKNOWN_ERROR", text: "Screenshots could not be uploaded."});
        return;
    });
}
async function deleteOneHandler(req, res) {
    console.log(chalk.grey("[mgg-server] GameScreenshots->Delete"));

    if(req.params.gameid === '') {
        res.status(400).json({name: "MISSING_FIELDS", text: "Required fields: gameId"});
        return;
    }

    // TODO: Check for Authentication and if user has access to game

    deleteGameScreenshot(parseInt(req.params.gameid)).then(() => {
        res.status(200).json({name: "GAMESCREENSHOTS_REMOVED", text: "Screenshot was removed"});
        return;
    }).catch((error) => {
        if(error === 404) {
            res.status(404).json({name: "GAMESCREENSHOT_NOT_FOUND", text: "Screenshot could not be found."});
            return;
        } else {
            res.status(500).json({name: "UNKNOWN_ERROR", text: "Screenshot could not be removed."});
            return;
        }
    });
}

module.exports = router;