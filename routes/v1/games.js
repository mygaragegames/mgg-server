const express = require('express');
const router = express.Router();
const chalk = require('chalk');

const { Game } = require('../../sequelize');

router.route('/')
    .get(getHandler)
    .post(postHandler)
    .put(putHandler)
    .delete(deleteHandler);

function getHandler(req, res) {
    console.log(chalk.grey("[mgg-server] Games->Get"));

    Game.findAll().then((users) => {
        res.json(users);
    });
}
function postHandler(req, res) {
    console.log(chalk.grey("[mgg-server] Games->Post"));

    // TODO: Check Authorization

    const data = {
        title: req.body.title,
        ingameID: req.body.ingameID,
        description: req.body.description,
        youtubeID: req.body.youtubeID,
        displayStatus: req.body.displayStatus,
        userId: 1
    };

    if(data.title === '' || data.ingameID === '') {
        res.status(400).json({name: "MISSING_FIELDS", text: "Required fields: title, ingameID"});
        return;
    }

    Game.create(data).then(() => {
        res.status(201).json({name: "GAME_CREATED", text: "Game was created"});
    }).catch(function(error) {
        if(error.name === 'SequelizeUniqueConstraintError') {
            console.log("ERRRORRR");
            res.status(409).json({name: "USERNAME_EMAIL_CONFLICT", text: "Username or email is already in use!"});
        } else {
            console.log(error);
            res.status(500).json({name: "UNKNOWN_SERVER_ERROR", text: "Unknown Server Error! Please try again later!"});
        }
    });
}
function putHandler(req, res) {
    console.log(chalk.grey("[mgg-server] Games->Put"));

    // TODO: Check Authorization

    // TODO: Update Game
}
function deleteHandler(req, res) {
    console.log(chalk.grey("[mgg-server] Games->Delete"));

    // TODO: Check Authorization

    // TODO: Remove Game
}

module.exports = router;