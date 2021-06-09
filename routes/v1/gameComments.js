const express = require('express');
const router = express.Router();
const chalk = require('chalk');
const auth = require('../../middlewares/auth');
const { parseAvatar } = require('../../src/parsers');
const { getOneGame } = require('../../src/games');
const { getOneGameComment, createGameComment, updateGameComment, deleteGameComment } = require('../../src/gameComments');

let isDev = process.env.NODE_ENV !== 'prod';

router.route('/:gameid')
    .get(getOneHandler)
    .post(auth.verifyToken, postOneHandler)
    .put(auth.verifyToken, putOneHandler)
    .delete(auth.verifyToken, deleteOneHandler);

/**
 * @api {get} /gameComments/:commentId Get detailled information data from a GameComment
 * @apiName GetOneGameComment
 * @apiGroup GameComments
 * @apiPermission Public
 * 
 * @apiParam {Integer} gameId The ID of the GameComment
 * 
 * @apiSuccess (200) {Integer} id ID
 * @apiSuccess (200) {String} text Comment Body
 * @apiSuccess (200) {DateTime} createdAt DateTime of creation
 * @apiSuccess (200) {DateTime} updatedAt DateTime of last change
 * @apiSuccess (200) {Integer} gameId ID of the Game from the Comment
 * @apiSuccess (200) {Integer} userId ID of the User who created the Comment
 * @apiSuccess (200) {Integer} id ID
 * @apiSuccess (200) {Object} user Object of the User who created the Comment
 * @apiError (404) GAMECOMMENT_NOT_FOUND There is no game comment with the id <code>commentId</code>
 */
async function getOneHandler(req, res) {
    if(isDev) console.log(chalk.grey("[mgg-server] (GameComments) GameComments->Get"));

    if(req.params.gameid == undefined) {
        res.status(400).json({name: "MISSING_FIELDS", text: "Required parameter: commentId"});
        return;
    }

    let gameCommentData = await getOneGameComment({ id: parseInt(req.params.gameid) }).catch(() => { return null; });
    if(gameCommentData === null) {
        res.status(404).json({name: "GAMECOMMENT_NOT_FOUND", text: "There is no game comment with the id " + req.params.gameid});
        return;
    }

    // remove security related fields for return
    gameCommentData.user.password = undefined;
    gameCommentData.user.email = undefined;
    gameCommentData.user.avatarFileName = parseAvatar(gameCommentData.user.avatarFileName);

    res.status(200).json(gameCommentData);
}

/**
 * @api {post} /gameComments/:gameId Creates a GameComment
 * @apiName CreateGameComment
 * @apiGroup GameComments
 * @apiPermission User
 * 
 * @apiHeader {String} x-access-token JWT Token for authentication
 * @apiParam {String} text Text of the GameComment
 * 
 * @apiSuccess (201) GAMECOMMENT_CREATED Comment was created
 * @apiError (404) GAME_NOT_FOUND There is no game with the id <code>gameId</code>
 * @apiError (403) AUTHENTICATION_BANNED Your account was banned. (Reason included in body)
 * @apiError (403) AUTHENTICATION_WRONG You are not allowed to perform this action.
 * @apiError (403) AUTHENTICATION_NEEDED You are not allowed to perform this action.
 */
async function postOneHandler(req, res) {
    if(isDev) console.log(chalk.grey("[mgg-server] (GameComments) GameComments->Post"));

    if(req.params.gameid === '' || req.body.text === '') {
        res.status(400).json({name: "MISSING_FIELDS", text: "Required fields: gameId, text"});
        return;
    }

    // Find attached game
    let game = await getOneGame({ id: req.params.gameid }).catch(() => { return null; });
    if(game === null) {
        res.status(404).json({name: "GAME_NOT_FOUND", text: "There is no game with the id " + req.params.gameid});
        return;
    }

    createGameComment(game, req.user, req.body.text).then(() => {
        res.status(201).json({name: "GAMECOMMENT_CREATED", text: "Comment was created"});
        return;
    }).catch((error) => {
        console.log(error);
        res.status(500).json({name: "UNKNOWN_ERROR", text: "Comment could not be created."});
        return;
    });
}

/**
 * @api {put} /gameComments/:commentId Updates a GameComment
 * @apiName UpdateGameComment
 * @apiGroup GameComments
 * @apiPermission User
 * @apiPermission Moderator
 * @apiPermission Admin
 * 
 * @apiHeader {String} x-access-token JWT Token for authentication
 * @apiParam {Integer} commentId The ID of the GameComment
 * @apiParam {String} text New text of the GameComment
 * 
 * @apiSuccess (200) GAMECOMMENT_UPDATED Comment was updated
 * @apiError (404) GAMECOMMENT_NOT_FOUND There is no game comment with the id <code>commentId</code>
 * @apiError (403) AUTHENTICATION_BANNED Your account was banned. (Reason included in body)
 * @apiError (403) AUTHENTICATION_WRONG You are not allowed to perform this action.
 * @apiError (403) AUTHENTICATION_NEEDED You are not allowed to perform this action.
 */
async function putOneHandler(req, res) {
    if(isDev) console.log(chalk.grey("[mgg-server] (GameComments) GameComments->Put"));

    if(req.params.gameid === '' || req.body.text === '') {
        res.status(400).json({name: "MISSING_FIELDS", text: "Required fields: gameCommentId, text"});
        return;
    }

    // Find attached game comment
    let gameComment = await getOneGameComment({ id: req.params.gameid }).catch(() => { return null; });
    if(gameComment === null) {
        res.status(404).json({name: "GAMECOMMENT_NOT_FOUND", text: `There is no game comment with the id ${req.params.gameid}`});
        return;
    }

    if(gameComment.userId !== req.userId && !req.userRoles.includes('moderator', 'admin')) {
        res.status(403).json({name: "AUTHENTICATION_NEEDED", text: "You are not allowed to perform this action."});
        return;
    }

    updateGameComment( gameComment, req.body.text ).then(() => {
        res.status(200).json({name: "GAMECOMMENT_UPDATED", text: "Comment was updated"});
        return;
    }).catch((error) => {
        if(error === 404) {
            res.status(404).json({name: "GAMECOMMENT_NOT_FOUND", text: `There is no game comment with the id ${req.params.gameid}`});
            return;
        } else {
            console.log(error);    
            res.status(500).json({name: "UNKNOWN_ERROR", text: "Comment could not be updated."});
            return;
        }
    });
}

/**
 * @api {delete} /gameComments/:commentId Deletes a GameComment
 * @apiName DeleteGameComment
 * @apiGroup GameComments
 * @apiPermission User
 * @apiPermission Moderator
 * @apiPermission Admin
 * 
 * @apiHeader {String} x-access-token JWT Token for authentication
 * @apiParam {Integer} commentId The ID of the GameComment
 * 
 * @apiSuccess (200) GAMECOMMENT_DELETED Comment was deleted
 * @apiError (404) GAMECOMMENT_NOT_FOUND There is no game comment with the id <code>commentId</code>
 * @apiError (403) AUTHENTICATION_BANNED Your account was banned. (Reason included in body)
 * @apiError (403) AUTHENTICATION_WRONG You are not allowed to perform this action.
 * @apiError (403) AUTHENTICATION_NEEDED You are not allowed to perform this action.
 */
async function deleteOneHandler(req, res) {
    if(isDev) console.log(chalk.grey("[mgg-server] (GameComments) GameComments->Delete"));

    if(req.params.gameid === '') {
        res.status(400).json({name: "MISSING_FIELDS", text: "Required fields: gameId"});
        return;
    }

    // Find attached game comment
    let gameComment = await getOneGameComment({ id: req.params.gameid }).catch(() => { return null; });
    if(gameComment === null) {
        res.status(404).json({name: "GAMECOMMENT_NOT_FOUND", text: `There is no game comment with the id ${req.params.gameid}`});
        return;
    }

    if(gameComment.userId !== req.userId && !req.userRoles.includes('moderator', 'admin')) {
        res.status(403).json({name: "AUTHENTICATION_NEEDED", text: "You are not allowed to perform this action."});
        return;
    }

    deleteGameComment( gameComment ).then(() => {
        res.status(200).json({name: "GAMECOMMENT_DELETED", text: "Comment was deleted"});
        return;
    }).catch((error) => {
        if(error === 404) {
            res.status(404).json({name: "GAMECOMMENT_NOT_FOUND", text: `There is no game comment with the id ${req.params.gameid}`});
            return;
        } else {
            console.log(error);    
            res.status(500).json({name: "UNKNOWN_ERROR", text: "Comment could not be deleted."});
            return;
        }
    });
}

module.exports = router;