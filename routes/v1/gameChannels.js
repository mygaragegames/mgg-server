const express = require('express');
const router = express.Router();
const chalk = require('chalk');
const auth = require('../../middlewares/auth');
const { getGameChannels, getOneGameChannel, createGameChannel, updateGameChannel, deleteGameChannel } = require('../../src/gameChannel');

router.route('/:channelid')
    .get(getOneHandler)
    .post(auth.verifyToken, postOneHandler)
    .put(auth.verifyToken, putOneHandler)
    .delete(auth.verifyToken, deleteOneHandler);

async function getOneHandler(req, res) {
    console.log(chalk.grey("[mgg-server] (GameChannels) GameChannels->Get"));

    if(req.params.channelid == undefined) {
        res.status(400).json({name: "MISSING_FIELDS", text: "Required parameter: channelId"});
        return;
    }

    let gameChannelData = await getOneGameChannel({ id: parseInt(req.params.channelid) }).catch(() => { return null; });
    if(gameChannelData === null) {
        res.status(404).json({name: "GAMECHANNEL_NOT_FOUND", text: "There is no game channel with the id " + req.params.channelid});
        return;
    }

    /*
    // remove security related fields for return
    gameCommentData.user.password = undefined;
    gameCommentData.user.email = undefined; */

    res.status(200).json(gameChannelData);
}
async function postOneHandler(req, res) {
    console.log(chalk.grey("[mgg-server] (GameChannels) GameChannels->Post"));

    if(req.params.channelid === '' || req.body.title === '' || req.body.description === '') {
        res.status(400).json({name: "MISSING_FIELDS", text: "Required fields: channelId, title, description"});
        return;
    }

    if(!req.userRoles.includes('moderator', 'admin')) {
        res.status(403).json({name: "AUTHENTICATION_NEEDED", text: "You are not allowed to perform this action."});
        return;
    }

    createGameChannel(req.body.title, req.body.description).then(() => {
        res.status(201).json({name: "GAMECHANNEL_CREATED", text: "Channel was created"});
        return;
    }).catch((error) => {
        console.log(error);
        res.status(500).json({name: "UNKNOWN_ERROR", text: "Channel could not be created."});
        return;
    });
}
async function putOneHandler(req, res) {
    console.log(chalk.grey("[mgg-server] (GameChannels) GameChannels->Put"));

    if(req.params.channelid === '' || req.body.title === '' || req.body.description === '') {
        res.status(400).json({name: "MISSING_FIELDS", text: "Required fields: channelId, title, description"});
        return;
    }

    // Find attached game channel
    let gameChannel = await getOneGameChannel({ id: req.params.channelid }).catch(() => { return null; });
    if(gameChannel === null) {
        res.status(404).json({name: "GAMECHANNEL_NOT_FOUND", text: "There is no game channel with the id " + req.params.channelid});
        return;
    }

    if(!req.userRoles.includes('moderator', 'admin')) {
        res.status(403).json({name: "AUTHENTICATION_NEEDED", text: "You are not allowed to perform this action."});
        return;
    }

    let data = {
        title: req.body.title,
        description: req.body.description
    };

    updateGameChannel( gameChannel, data ).then(() => {
        res.status(200).json({name: "GAMECHANNEL_UPDATED", text: "Channel was updated"});
        return;
    }).catch((error) => {
        if(error === 404) {
            res.status(404).json({name: "GAMECHANNEL_NOT_FOUND", text: "There is no game channel with the id " + req.params.channelid});
            return;
        } else {
            console.log(error);    
            res.status(500).json({name: "UNKNOWN_ERROR", text: "Channel could not be updated."});
            return;
        }
    });
}
async function deleteOneHandler(req, res) {
    console.log(chalk.grey("[mgg-server] (GameChannels) GameChannels->Delete"));

    if(req.params.gameid === '') {
        res.status(400).json({name: "MISSING_FIELDS", text: "Required fields: gameId"});
        return;
    }

    // Find attached game channel
    let gameChannel = await getOneGameChannel({ id: req.params.channelid }).catch(() => { return null; });
    if(gameChannel === null) {
        res.status(404).json({name: "GAMECHANNEL_NOT_FOUND", text: "There is no game channel with the id " + req.params.channelid});
        return;
    }

    if(!req.userRoles.includes('moderator', 'admin')) {
        res.status(403).json({name: "AUTHENTICATION_NEEDED", text: "You are not allowed to perform this action."});
        return;
    }

    deleteGameChannel( gameChannel ).then(() => {
        res.status(200).json({name: "GAMECHANNEL_DELETED", text: "Channel was deleted"});
        return;
    }).catch((error) => {
        if(error === 404) {
            res.status(404).json({name: "GAMECHANNEL_NOT_FOUND", text: "There is no game channel with the id " + req.params.channelid});
            return;
        } else {
            console.log(error);    
            res.status(500).json({name: "UNKNOWN_ERROR", text: "Channel could not be deleted."});
            return;
        }
    });
}

module.exports = router;