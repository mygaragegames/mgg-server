const express = require('express');
const router = express.Router();
const chalk = require('chalk');
const auth = require('../../middlewares/auth');
const { parseGameData } = require('../../src/parsers');
const { getOneGame } = require('../../src/games');
const { getQueueGames, deleteFromQueue } = require('../../src/modQueue');

let isDev = process.env.NODE_ENV !== 'prod';

router.route('/')
    .get(auth.verifyToken, getQueueHandler);

router.route('/:gameid')
    .delete(auth.verifyToken, deleteQueueHandler);

/**
 * @api {get} /queue Get all games in the moderation queue
 * @apiName GetModerationQueue
 * @apiGroup Moderation
 * @apiPermission Moderator
 * @ApiPermission Admin
 * 
 * @apiHeader {String} x-access-token JWT Token for authentication
 * 
 * @apiSuccess (200) {Object} game Object of the Game
 * @apiError (403) AUTHENTICATION_BANNED Your account was banned. (Reason included in body)
 * @apiError (403) AUTHENTICATION_WRONG You are not allowed to perform this action.
 * @apiError (403) AUTHENTICATION_NEEDED You are not allowed to perform this action.
 */
async function getQueueHandler(req, res) {
    if(isDev) console.log(chalk.grey("[mgg-server] (Moderation) Queue->Get"));

    // Check if user is moderator/admin
    if(!['moderator', 'admin'].some(str => req.userRoles.includes(str))) {
        res.status(403).json({name: "AUTHENTICATION_NEEDED", text: "You are not allowed to perform this action."});
        return;
    }

    let gamesData = await getQueueGames();

    gamesData = parseGameData(gamesData);

    res.status(200).json(gamesData);
}

/**
 * @api {delete} /queue/:gameId Deletes a game from the moderation queue
 * @apiName DeleteFromModerationQueue
 * @apiGroup Moderation
 * @apiPermission Moderator
 * @ApiPermission Admin
 * 
 * @apiHeader {String} x-access-token JWT Token for authentication
 * @apiParam {Integer} gameId The ID of the User
 * 
 * @apiSuccess (201) GAME_UPDATED Game was deleted from the moderation queue
 * @apiError (404) GAME_NOT_FOUND There is no game with the id <code>gameId</code>
 * @apiError (403) AUTHENTICATION_BANNED Your account was banned. (Reason included in body)
 * @apiError (403) AUTHENTICATION_WRONG You are not allowed to perform this action.
 * @apiError (403) AUTHENTICATION_NEEDED You are not allowed to perform this action.
 */
async function deleteQueueHandler(req, res) {
    if(isDev) console.log(chalk.grey("[mgg-server] (Moderation) Queue->Delete"));

    let game = await getOneGame({ id: parseInt(req.params.gameid) }).catch(() => { return null; });
    if(game === null) {
        res.status(404).json({name: "GAME_NOT_FOUND", text: `There is no game with the id ${req.params.gameid}`});
        return;
    }

    // Check if user is moderator/admin
    if(!['moderator', 'admin'].some(str => req.userRoles.includes(str))) {
        res.status(403).json({name: "AUTHENTICATION_NEEDED", text: "You are not allowed to perform this action."});
        return;
    }

    deleteFromQueue(game).then(() => {
        res.status(201).json({name: "GAME_UPDATED", text: "Game was deleted from the moderation queue"});
    }).catch((error) => {
        switch(error) {
            default:
                console.log(error);
                res.status(500).json({name: "UNKNOWN_ERROR", text: "Game could not be deleted from the moderation queue."});
                return;
        }
    });
}

module.exports = router;