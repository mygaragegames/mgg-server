const express = require('express');
const router = express.Router();
const chalk = require('chalk');
const auth = require('../../middlewares/auth');
const { parseGameCover, parseAvatar } = require('../../src/parsers');
const { getGameChannels, getOneGameChannel, createGameChannel, updateGameChannel, deleteGameChannel } = require('../../src/gameChannel');

let isDev = process.env.NODE_ENV !== 'prod';

router.route('/')
    .get(getAllHandler)
    .post(auth.verifyToken, postOneHandler);

router.route('/:channelid')
    .get(auth.optionalToken, getOneHandler)
    .put(auth.verifyToken, putOneHandler)
    .delete(auth.verifyToken, deleteOneHandler);

/**
 * @api {get} /gameChannels Get all available GameChannels
 * @apiName GetAllGameChannels
 * @apiGroup GameChannels
 * @apiPermission Public
 * 
 * @apiSuccess (200) {Array} gameChannels Array of GameChannels
 */
async function getAllHandler(req, res) {
    if(isDev) console.log(chalk.grey("[mgg-server] (GameChannels) GameChannels->Get"));

    let gameChannels = await getGameChannels({}).catch(() => { return []; });
    res.status(200).json(gameChannels);
}

/**
 * @api {get} /gameChannels/:channelId Get detailled information and list of games from a GameChannel
 * @apiName GetOneGameChannel
 * @apiGroup GameChannels
 * @apiPermission Public
 * 
 * @apiHeader {String} x-access-token (Optional) JWT Token for authentication
 * @apiParam {Integer} channelId The ID of the GameChannel
 * 
 * @apiSuccess (200) {Integer} id ID
 * @apiSuccess (200) {String} title Title
 * @apiSuccess (200) {String} description Description
 * @apiSuccess (200) {DateTime} createAt DateTime of creation
 * @apiSuccess (200) {DateTime} updatedAt DateTime of last change
 * @apiSuccess (200) {Array} games Array of Games in this Channel
 * @apiError (404) GAMECHANNEL_NOT_FOUND There is no game channel with the id <code>channelId</code>
 */
async function getOneHandler(req, res) {
    if(isDev) console.log(chalk.grey("[mgg-server] (GameChannels) GameChannels->Get"));

    if(req.params.channelid == undefined) {
        res.status(400).json({name: "MISSING_FIELDS", text: "Required parameter: channelId"});
        return;
    }

    let gameChannelData = await getOneGameChannel({ id: parseInt(req.params.channelid) }, req.userId, req.userRoles).catch(() => { return null; });
    if(gameChannelData === null) {
        res.status(404).json({name: "GAMECHANNEL_NOT_FOUND", text: `There is no game channel with the id ${req.params.channelid}`});
        return;
    }

    gameChannelData.games.forEach((game) => {
        game.coverFileName = parseGameCover(game.coverFileName);

        // remove security related fields for return
        game.user.password = undefined;
        game.user.email = undefined;
        game.user.loginDiscord = undefined;
        game.user.loginTwitter = undefined;
        game.user.loginYouTube = undefined;
        game.user.avatarFileName = parseAvatar(game.user.avatarFileName);
    });

    res.status(200).json(gameChannelData);
}

/**
 * @api {post} /gameChannels Creates a GameChannel
 * @apiName CreateGameChannel
 * @apiGroup GameChannels
 * @apiPermission Moderator
 * @ApiPermission Admin
 * 
 * @apiHeader {String} x-access-token JWT Token for authentication
 * @apiParam {String} title Title of the GameChannel
 * @apiParam {String} description Description of the GameChannel
 * 
 * @apiSuccess (201) GAMECHANNEL_CREATED Channel was created
 * @apiError (403) AUTHENTICATION_BANNED Your account was banned. (Reason included in body)
 * @apiError (403) AUTHENTICATION_WRONG You are not allowed to perform this action.
 * @apiError (403) AUTHENTICATION_NEEDED You are not allowed to perform this action.
 */
async function postOneHandler(req, res) {
    if(isDev) console.log(chalk.grey("[mgg-server] (GameChannels) GameChannels->Post"));

    if(req.body.title === '' || req.body.description === '') {
        res.status(400).json({name: "MISSING_FIELDS", text: "Required fields: title, description"});
        return;
    }

    if(!['moderator', 'admin'].some(str => req.userRoles.includes(str))) {
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

/**
 * @api {put} /gameChannels/:channelId Updates a GameChannel
 * @apiName UpdateGameChannel
 * @apiGroup GameChannels
 * @apiPermission Moderator
 * @ApiPermission Admin
 * 
 * @apiHeader {String} x-access-token JWT Token for authentication
 * @apiParam {Integer} channelId The ID of the GameChannel
 * @apiParam {String} title New title of the GameChannel
 * @apiParam {String} description New description of the GameChannel
 * 
 * @apiSuccess (200) GAMECHANNEL_UPDATED Channel was updated
 * @apiError (404) GAMECHANNEL_NOT_FOUND There is no game channel with the id <code>channelId</code>
 * @apiError (403) AUTHENTICATION_BANNED Your account was banned. (Reason included in body)
 * @apiError (403) AUTHENTICATION_WRONG You are not allowed to perform this action.
 * @apiError (403) AUTHENTICATION_NEEDED You are not allowed to perform this action.
 */
async function putOneHandler(req, res) {
    if(isDev) console.log(chalk.grey("[mgg-server] (GameChannels) GameChannels->Put"));

    if(req.params.channelid === '' || req.body.title === '' || req.body.description === '') {
        res.status(400).json({name: "MISSING_FIELDS", text: "Required fields: channelId, title, description"});
        return;
    }

    // Find attached game channel
    let gameChannel = await getOneGameChannel({ id: req.params.channelid }).catch(() => { return null; });
    if(gameChannel === null) {
        res.status(404).json({name: "GAMECHANNEL_NOT_FOUND", text: `There is no game channel with the id ${req.params.channelid}`});
        return;
    }

    if(!['moderator', 'admin'].some(str => req.userRoles.includes(str))) {
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
            res.status(404).json({name: "GAMECHANNEL_NOT_FOUND", text: `There is no game channel with the id ${req.params.channelid}`});
            return;
        } else {
            console.log(error);    
            res.status(500).json({name: "UNKNOWN_ERROR", text: "Channel could not be updated."});
            return;
        }
    });
}

/**
 * @api {delete} /gameChannels/:channelId Deletes a GameChannel
 * @apiName DeleteGameChannel
 * @apiGroup GameChannels
 * @apiPermission Moderator
 * @ApiPermission Admin
 * 
 * @apiHeader {String} x-access-token JWT Token for authentication
 * @apiParam {Integer} channelId The ID of the GameChannel
 * 
 * @apiSuccess (200) GAMECHANNEL_DELETED Channel was deleted
 * @apiError (404) GAMECHANNEL_NOT_FOUND There is no game channel with the id <code>channelId</code>
 * @apiError (403) AUTHENTICATION_BANNED Your account was banned. (Reason included in body)
 * @apiError (403) AUTHENTICATION_WRONG You are not allowed to perform this action.
 * @apiError (403) AUTHENTICATION_NEEDED You are not allowed to perform this action.
 */
async function deleteOneHandler(req, res) {
    if(isDev) console.log(chalk.grey("[mgg-server] (GameChannels) GameChannels->Delete"));

    if(req.params.gameid === '') {
        res.status(400).json({name: "MISSING_FIELDS", text: "Required fields: gameId"});
        return;
    }

    // Find attached game channel
    let gameChannel = await getOneGameChannel({ id: req.params.channelid }).catch(() => { return null; });
    if(gameChannel === null) {
        res.status(404).json({name: "GAMECHANNEL_NOT_FOUND", text: `There is no game channel with the id ${req.params.channelid}`});
        return;
    }

    if(!['moderator', 'admin'].some(str => req.userRoles.includes(str))) {
        res.status(403).json({name: "AUTHENTICATION_NEEDED", text: "You are not allowed to perform this action."});
        return;
    }

    deleteGameChannel( gameChannel ).then(() => {
        res.status(200).json({name: "GAMECHANNEL_DELETED", text: "Channel was deleted"});
        return;
    }).catch((error) => {
        if(error === 404) {
            res.status(404).json({name: "GAMECHANNEL_NOT_FOUND", text: `There is no game channel with the id ${req.params.channelid}`});
            return;
        } else {
            console.log(error);    
            res.status(500).json({name: "UNKNOWN_ERROR", text: "Channel could not be deleted."});
            return;
        }
    });
}

module.exports = router;