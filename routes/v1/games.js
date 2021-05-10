const express = require('express');
const router = express.Router();
const chalk = require('chalk');
const auth = require('../../middlewares/auth');
const { User, Game } = require('../../sequelize');
const { getAllGames, getOneGame, createGame } = require('../../src/games');
const { getGameScreenshots } = require('../../src/gameScreenshots');

router.route('/')
    .get(getAllHandler)
    .post(auth.verifyToken, postOneHandler);

router.route('/:gameid')
    .get(getOneHandler)
    .put(auth.verifyToken, putOneHandler)
    .delete(auth.verifyToken, deleteOneHandler);

async function getAllHandler(req, res) {
    console.log(chalk.grey("[mgg-server] Games->Get"));

    let games = await getAllGames();
    res.status(200).json(games);
}
async function getOneHandler(req, res) {
    console.log(chalk.grey("[mgg-server] Games->Get"));

    if(req.params.gameid == undefined) {
        res.status(400).json({name: "MISSING_DATA", text: "Required parameter: gameid"});
        return;
    }

    let gameData = {
        detail: await getOneGame({ id: parseInt(req.params.gameid) }),
        screenshots: await getGameScreenshots({ gameId: parseInt(req.params.gameid) })
    };

    res.status(200).json(gameData);
}
async function postOneHandler(req, res) {
    console.log(chalk.grey("[mgg-server] Games->Post"));

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
        res.status(201).json( game );
    }).catch((error) => {
        console.error(error);
        res.status(500).json({name: "UNKNOWN_SERVER_ERROR", text: "Unknown Server Error! Please try again later!"});
    });
}
async function putOneHandler(req, res) {
    console.log(chalk.grey("[mgg-server] Games->Put"));

    // TODO: Update Game
}
async function deleteOneHandler(req, res) {
    console.log(chalk.grey("[mgg-server] Games->Delete"));

    // TODO: Check Authorization

    // TODO: Remove Game
}

module.exports = router;