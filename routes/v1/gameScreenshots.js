const express = require('express');
const multer = require('multer');
const router = express.Router();
const chalk = require('chalk');
const auth = require('../../middlewares/auth');
const { getOneGame } = require('../../src/games');
const { getOneGameScreenshot, saveGameScreenshot, deleteGameScreenshot } = require('../../src/gameScreenshots');

let isDev = process.env.NODE_ENV !== 'prod';

let upload = multer({ dest: '/tmp/'});

router.route('/:gameid')
    .post(auth.verifyToken, upload.array('screenshots'), postOneHandler)
    .delete(auth.verifyToken, deleteOneHandler);

/**
 * @api {post} /gameScreenshots/:gameId Uploads a screenshot
 * @apiName UploadGameScreenshot
 * @apiGroup GameScreenshots
 * 
 * @apiHeader {String} x-access-token JWT Token for authentication
 * @apiParam {Integer} gameId The ID of the Game
 * @apiParam {Array} screenshots multipart/form-data array of png or jpg files
 * 
 * @apiSuccess (201) GAMESCREENSHOTS_UPLOADED Comment were uploaded
 * @apiError (404) GAME_NOT_FOUND There is no game with the id <code>gameId</code>
 * @apiError (400) GAMESCREENSHOT_COVER_WRONGFORMAT One or more screenshots are not a png or jpg file
 * @apiError (403) AUTHENTICATION_BANNED Your account was banned. (Reason included in body)
 * @apiError (403) AUTHENTICATION_WRONG You are not allowed to perform this action.
 * @apiError (403) AUTHENTICATION_NEEDED You are not allowed to perform this action.
 */
async function postOneHandler(req, res) {
    if(isDev) console.log(chalk.grey("[mgg-server] (GameScreenshots) GameScreenshots->Post"));

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
    }).catch((error) => {
        switch(error) {
            default:
                res.status(500).json({name: "UNKNOWN_ERROR", text: "Screenshots could not be updated."});
                return;
            case 400:
                res.status(400).json({name: "GAMESCREENSHOT_COVER_WRONGFORMAT", text: "One or more screenshots are not a png or jpg file."});
                return;
        }
    });
}

/**
 * @api {delete} /gameScreenshots/:screenshotId Deletes a GameScreenshot
 * @apiName DeleteGameScreenshot
 * @apiGroup GameScreenshots
 * 
 * @apiHeader {String} x-access-token JWT Token for authentication
 * @apiParam {Integer} screenshotId The ID of the GameScreenshot
 * 
 * @apiSuccess (200) GAMESCREENSHOT_DELETED Screenshot was deleted
 * @apiError (404) GAMESCREENSHOT_NOT_FOUND There is no game screenshot with the id <code>screenshotId</code>
 * @apiError (403) AUTHENTICATION_BANNED Your account was banned. (Reason included in body)
 * @apiError (403) AUTHENTICATION_WRONG You are not allowed to perform this action.
 * @apiError (403) AUTHENTICATION_NEEDED You are not allowed to perform this action.
 */
async function deleteOneHandler(req, res) {
    if(isDev) console.log(chalk.grey("[mgg-server] (GameScreenshots) GameScreenshots->Delete"));

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