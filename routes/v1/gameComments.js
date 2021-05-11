const express = require('express');
const router = express.Router();
const chalk = require('chalk');
const auth = require('../../middlewares/auth');
const { getOneGame } = require('../../src/games');
const { getOneGameComment, createGameComment, updateGameComment, deleteGameComment } = require('../../src/gameComments');

router.route('/:gameid')
    .get(getOneHandler)
    .post(auth.verifyToken, postOneHandler)
    .put(auth.verifyToken, putOneHandler)
    .delete(auth.verifyToken, deleteOneHandler);

async function getOneHandler(req, res) {
    console.log(chalk.grey("[mgg-server] (GameComments) GameComments->Get"));

    if(req.params.gameid == undefined) {
        res.status(400).json({name: "MISSING_FIELDS", text: "Required parameter: gameid"});
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

    res.status(200).json(gameCommentData);
}
async function postOneHandler(req, res) {
    console.log(chalk.grey("[mgg-server] (GameComments) GameComments->Post"));

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
async function putOneHandler(req, res) {
    console.log(chalk.grey("[mgg-server] (GameComments) GameComments->Put"));

    if(req.params.gameid === '' || req.body.text === '') {
        res.status(400).json({name: "MISSING_FIELDS", text: "Required fields: gameCommentId, text"});
        return;
    }

    // Find attached game comment
    let gameComment = await getOneGameComment({ id: req.params.gameid }).catch(() => { return null; });
    if(gameComment === null) {
        res.status(404).json({name: "GAMECOMMENT_NOT_FOUND", text: "There is no game comment with the id " + req.params.gameid});
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
            res.status(404).json({name: "GAMECOMMENT_NOT_FOUND", text: "There is no game comment with the id " + req.params.gameid});
            return;
        } else {
            console.log(error);    
            res.status(500).json({name: "UNKNOWN_ERROR", text: "Comment could not be updated."});
            return;
        }
    });
}
async function deleteOneHandler(req, res) {
    console.log(chalk.grey("[mgg-server] (GameComments) GameComments->Delete"));

    if(req.params.gameid === '') {
        res.status(400).json({name: "MISSING_FIELDS", text: "Required fields: gameId"});
        return;
    }

    // Find attached game comment
    let gameComment = await getOneGameComment({ id: req.params.gameid }).catch(() => { return null; });
    if(gameComment === null) {
        res.status(404).json({name: "GAMECOMMENT_NOT_FOUND", text: "There is no game comment with the id " + req.params.gameid});
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
            res.status(404).json({name: "GAMECOMMENT_NOT_FOUND", text: "There is no game comment with the id " + req.params.gameid});
            return;
        } else {
            console.log(error);    
            res.status(500).json({name: "UNKNOWN_ERROR", text: "Comment could not be deleted."});
            return;
        }
    });
}

module.exports = router;