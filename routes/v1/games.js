const express = require('express');
const multer = require('multer');
const router = express.Router();
const chalk = require('chalk');
const auth = require('../../middlewares/auth');
const { parseAvatar, parseGameScreenshot, parseGameCover } = require('../../src/parsers');
const { getOneGame, createGame, deleteGame, updateGame, saveGameCover, deleteGameCover } = require('../../src/games');
const { getOnePlaylist } = require('../../src/playlists');

let isDev = process.env.NODE_ENV !== 'prod';

let upload = multer({ dest: '/tmp/'});

router.route('/')
    .post(auth.verifyToken, postOneHandler);

router.route('/:gameid')
    .get(auth.optionalToken, getOneHandler)
    .put(auth.verifyToken, putOneHandler)
    .delete(auth.verifyToken, deleteOneHandler);

router.route('/:gameid/cover')
    .put(auth.verifyToken, upload.single('cover'), putOneCoverHandler)
    .delete(auth.verifyToken, deleteOneCoverHandler);

/**
 * @api {get} /games/:gameId Get detailled information from a Game
 * @apiName GetOneGame
 * @apiGroup Games
 * @apiPermission Public
 * 
 * @apiHeader {String} x-access-token (Optional) JWT Token for authentication
 * @apiParam {Integer} gameId The ID of the Game
 * 
 * @apiSuccess (200) {Object} game Object of the Game
 * @apiSuccess (200) {Integer} game.id ID
 * @apiSuccess (200) {String} game.title Title
 * @apiSuccess (200) {String} game.ingameID Ingame-ID
 * @apiSuccess (200) {String} game.description Description
 * @apiSuccess (200) {String} game.coverFileName URL of the cover
 * @apiSuccess (200) {String} game.youtubeID Trailer YouTube-ID of the Game
 * @apiSuccess (200) {Integer} game.displayStatus Visibility of the Game. 0 = Public, 1 = Hidden, 2 = Private
 * @apiSuccess (200) {DateTime} game.createAt DateTime of creation
 * @apiSuccess (200) {DateTime} game.updatedAt DateTime of last change
 * @apiSuccess (200) {Integer} game.userId ID of the User who created the Game
 * @apiSuccess (200) {Integer} game.user Object of the User who created the Game
 * @apiSuccess (200) {Array} game.screenshots Array of GameScreenshots
 * @apiSuccess (200) {Array} game.channels Array of GameChannels the Game is part of
 * @apiSuccess (200) {Array} game.comments Array of GameComments of the Game
 * @apiSuccess (200) {Boolean} isInPlaylist If a JWT Token is provided, this bool will be true if the Game is in the "Play later" playlist of the User
 * @apiError (404) GAME_NOT_FOUND There is no game with the id <code>gameId</code>
 * @apiError (403) GAME_PRIVATE You are not allowed to see this game.
 */
async function getOneHandler(req, res) {
    if(isDev) console.log(chalk.grey("[mgg-server] (Games) Games->Get"));

    if(req.params.gameid == undefined) {
        res.status(400).json({name: "MISSING_FIELDS", text: "Required parameter: gameid"});
        return;
    }

    gameData = await getOneGame({ id: parseInt(req.params.gameid) }).catch(() => { return null; });
    if(gameData === null) {
        res.status(404).json({name: "GAME_NOT_FOUND", text: `There is no game with the id ${req.params.gameid}`});
        return;
    }

    // Only allow moderators/admins and owners to get display status 2 games
    if(gameData.displayStatus == 2) {
        if(gameData.userId !== req.userId && !req.userRoles.includes('moderator', 'admin')) {
            res.status(403).json({name: "GAME_PRIVATE", text: "You are not allowed to see this game."});
            return;
        }
    }

    // Check if game is in playlist
    let isInPlaylist = false;
    if(req.user != null) {
        let playlistData = await getOnePlaylist({ id: req.user.playlists[0].id }).catch(() => { return null; });
        if(playlistData != null) {
            playlistData.games.forEach(game => {
                if(game.id === gameData.id) {
                    isInPlaylist = true;
                }
            })
        }
    }

    gameData.coverFileName = parseGameCover(gameData.coverFileName);

    // remove security related fields for return
    gameData.user.password = undefined;
    gameData.user.email = undefined;
    gameData.user.loginDiscord = undefined;
    gameData.user.loginTwitter = undefined;
    gameData.user.loginYouTube = undefined;

    gameData.user.avatarFileName = parseAvatar(gameData.user.avatarFileName);

    gameData.comments.forEach((comment) => {
        // remove security related fields for return
        comment.user.password = undefined;
        comment.user.email = undefined;
        comment.user.loginDiscord = undefined;
        comment.user.loginTwitter = undefined;
        comment.user.loginYouTube = undefined;
        comment.user.avatarFileName = parseAvatar(comment.user.avatarFileName);
    });

    gameData.screenshots.forEach((gameScreenshot) => {
        gameScreenshot.fileName = parseGameScreenshot(gameScreenshot.fileName);
    });

    res.status(200).json({ game: gameData, isInPlaylist: isInPlaylist});
}

/**
 * @api {post} /games Create a Game
 * @apiName CreateGame
 * @apiGroup Games
 * @apiPermission User
 * 
 * @apiHeader {String} x-access-token JWT Token for authentication
 * @apiParam {String} title Title
 * @apiParam {String} description (Optional) Description
 * @apiParam {String} ingameID Ingame-ID (Syntax: G-000-000-000)
 * @apiParam {Integer} displayStatus (Optional) Visibility of the Game. 0 = Public, 1 = Hidden, 2 = Private
 * @apiParam {String} youtubeID (Optional) Trailer YouTube-ID of the Game
 * 
 * @apiSuccess (200) {Integer} id ID
 * @apiSuccess (200) {String} title Title
 * @apiSuccess (200) {String} ingameID Ingame-ID
 * @apiSuccess (200) {String} description (Optional) Description
 * @apiSuccess (200) {String} coverFileName URL of the cover
 * @apiSuccess (200) {String} youtubeID (Optional) Trailer YouTube-ID of the Game
 * @apiSuccess (200) {Integer} displayStatus Visibility of the Game. 0 = Public, 1 = Hidden, 2 = Private
 * @apiSuccess (200) {DateTime} createAt DateTime of creation
 * @apiSuccess (200) {DateTime} updatedAt DateTime of last change
 * @apiSuccess (200) {Integer} userId ID of the User who created the Game
 * @apiError (400) GAME_GAMEID_WRONGFORMAT The ingame ID has the wrong format (G-000-000-000).
 * @apiError (403) AUTHENTICATION_BANNED Your account was banned. (Reason included in body)
 * @apiError (403) AUTHENTICATION_WRONG You are not allowed to perform this action.
 * @apiError (403) AUTHENTICATION_NEEDED You are not allowed to perform this action.
 */
async function postOneHandler(req, res) {
    if(isDev) console.log(chalk.grey("[mgg-server] (Games) Games->Post"));

    let filteredDisplayStatus = 0;
    switch(parseInt(req.body.displayStatus)) {
        default:
        case 0:
            filteredDisplayStatus = 0;
            break;
        case 1:
            filteredDisplayStatus = 1;
            break;
        case 2:
            filteredDisplayStatus = 2;
            break;
    }

    const data = {
        title: req.body.title,
        ingameID: req.body.ingameID,
        description: req.body.description,
        displayStatus: filteredDisplayStatus,
        youtubeID: req.body.youtubeID,
        userId: req.user.id
    };

    if(data.title === '' || data.ingameID === '') {
        res.status(400).json({name: "MISSING_FIELDS", text: "Required fields: title, ingameID"});
        return;
    }

    createGame( data ).then((game) => {
        if(req.body.channels != "" && req.body.channels != undefined) {
            game.setChannels(req.body.channels);
        }

        game.coverFileName = parseGameCover(game.coverFileName);

        res.status(201).json( game );
    }).catch((error) => {
        switch(error) {
            default:
                res.status(500).json({name: "UNKNOWN_ERROR", text: "Game could not be created."});
                return;
            case 400:
                res.status(400).json({name: "GAME_GAMEID_WRONGFORMAT", text: "The ingame ID has the wrong format (G-000-000-000)."});
                return;
        }
    });
}

/**
 * @api {put} /games/:gameId Update a Game
 * @apiName UpdateGame
 * @apiGroup Games
 * @apiPermission User
 * @apiPermission Moderator
 * @apiPermission Admin
 * 
 * @apiHeader {String} x-access-token JWT Token for authentication
 * @apiParam {Integer} gameId ID of the Game
 * @apiParam {String} title (Optional) Title
 * @apiParam {String} description (Optional) Description
 * @apiParam {String} ingameID (Optional) Ingame-ID (Syntax: G-000-000-000)
 * @apiParam {Integer} displayStatus (Optional) Visibility of the Game. 0 = Public, 1 = Hidden, 2 = Private
 * @apiParam {String} youtubeID (Optional) Trailer YouTube-ID of the Game
 * 
 * @apiSuccess (201) GAME_UPDATED Game was updated.
 * @apiError (400) GAME_GAMEID_WRONGFORMAT The ingame ID has the wrong format (G-000-000-000).
 * @apiError (403) AUTHENTICATION_BANNED Your account was banned. (Reason included in body)
 * @apiError (403) AUTHENTICATION_WRONG You are not allowed to perform this action.
 * @apiError (403) AUTHENTICATION_NEEDED You are not allowed to perform this action.
 * @apiError (404) GAME_NOT_FOUND There is no game with the id <code>gameId</code>
 */
async function putOneHandler(req, res) {
    if(isDev) console.log(chalk.grey("[mgg-server] (Games) Games->Put"));

    let filteredDisplayStatus = 0;
    switch(parseInt(req.body.displayStatus)) {
        default:
        case 0:
            filteredDisplayStatus = 0;
            break;
        case 1:
            filteredDisplayStatus = 1;
            break;
        case 2:
            filteredDisplayStatus = 2;
            break;
    }

    const data = {
        title: req.body.title,
        ingameID: req.body.ingameID,
        description: req.body.description,
        displayStatus: filteredDisplayStatus,
        youtubeID: req.body.youtubeID,
    };

    let game = await getOneGame({ id: parseInt(req.params.gameid) }).catch(() => { return null; });
    if(game === null) {
        res.status(404).json({name: "GAME_NOT_FOUND", text: `There is no game with the id ${req.params.gameid}`});
        return;
    }

    // Check if user is owner or moderator/admin
    if(game.userId !== req.userId && !req.userRoles.includes('moderator', 'admin')) {
        res.status(403).json({name: "AUTHENTICATION_NEEDED", text: "You are not allowed to perform this action."});
        return;
    }

    if(req.body.channels != undefined) {
        game.setChannels(req.body.channels);
    }

    updateGame( game, data ).then((data) => {
        res.status(201).json({name: "GAME_UPDATED", text: "Game was updated."});
        return;
    }).catch((error) => {
        switch(error) {
            default:
                res.status(500).json({name: "UNKNOWN_ERROR", text: "Game could not be updated."});
                return;
            case 400:
                res.status(400).json({name: "GAME_INGAMEID_WRONGFORMAT", text: "The ingame ID has the wrong format (G-000-000-000)."});
                return;
        }
    });
}

/**
 * @api {delete} /games/:gameId Deletes a Game
 * @apiName DeleteGame
 * @apiGroup Games
 * @apiPermission User
 * @apiPermission Moderator
 * @apiPermission Admin
 * 
 * @apiHeader {String} x-access-token JWT Token for authentication
 * @apiParam {Integer} gameId ID of the Game
 * 
 * @apiSuccess (201) GAME_DELETED Game was deleted.
 * @apiError (403) AUTHENTICATION_BANNED Your account was banned. (Reason included in body)
 * @apiError (403) AUTHENTICATION_WRONG You are not allowed to perform this action.
 * @apiError (403) AUTHENTICATION_NEEDED You are not allowed to perform this action.
 * @apiError (404) GAME_NOT_FOUND There is no game with the id <code>gameId</code>
 */
async function deleteOneHandler(req, res) {
    if(isDev) console.log(chalk.grey("[mgg-server] (Games) Games->Delete"));

    let game = await getOneGame({ id: parseInt(req.params.gameid) }).catch(() => { return null; });
    if(game === null) {
        res.status(404).json({name: "GAME_NOT_FOUND", text: `There is no game with the id ${req.params.gameid}`});
        return;
    }

    // Check if user is owner or moderator/admin
    if(game.userId !== req.userId && !req.userRoles.includes('moderator', 'admin')) {
        res.status(403).json({name: "AUTHENTICATION_NEEDED", text: "You are not allowed to perform this action."});
        return;
    }

    deleteGame( game ).then((data) => {
        res.status(200).json({name: "GAME_DELETED", text: "Game was deleted."});
        return;
    }).catch((error) => {
        res.status(500).json({name: "UNKNOWN_SERVER_ERROR", text: "Unknown Server Error! Please try again later!"});
    });
}

/**
 * @api {put} /game/:gameId/cover Uploads a cover to a Game
 * @apiName UploadGameCover
 * @apiGroup Games
 * @apiPermission User
 * @apiPermission Moderator
 * @apiPermission Admin
 * 
 * @apiHeader {String} x-access-token JWT Token for authentication
 * @apiParam {Integer} gameId The ID of the Game
 * @apiParam {File} cover multipart/form-data of a png or jpg file
 * 
 * @apiSuccess (201) GAME_COVER_UPDATED Cover of game was updated.
 * @apiError (404) GAME_NOT_FOUND There is no game with the id <code>gameId</code>
 * @apiError (400) GAME_COVER_WRONGFORMAT Your cover is not a png or jpg file.
 * @apiError (403) AUTHENTICATION_BANNED Your account was banned. (Reason included in body)
 * @apiError (403) AUTHENTICATION_WRONG You are not allowed to perform this action.
 * @apiError (403) AUTHENTICATION_NEEDED You are not allowed to perform this action.
 */
async function putOneCoverHandler(req, res) {
    if(isDev) console.log(chalk.grey("[mgg-server] (Games) Game->PutCover"));

    if(req.params.gameid === '' || req.file === undefined) {
        res.status(400).json({name: "MISSING_FIELDS", text: "Required fields: gameId, cover"});
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

    saveGameCover(game, req.file).then(() => {
        res.status(201).json({name: "GAME_COVER_UPDATED", text: "Cover of game was updated."});
        return;
    }).catch((error) => {
        switch(error) {
            default:
                res.status(500).json({name: "UNKNOWN_ERROR", text: "Cover could not be updated."});
                return;
            case 400:
                res.status(400).json({name: "GAME_COVER_WRONGFORMAT", text: "Your cover is not a png or jpg file."});
                return;
        }
    });
}

/**
 * @api {delete} /game/:gameId/cover Deletes the cover of a Game
 * @apiName DeleteGameCover
 * @apiGroup Games
 * @apiPermission Public
 * @apiPermission Moderator
 * @apiPermission Admin
 * 
 * @apiHeader {String} x-access-token JWT Token for authentication
 * @apiParam {Integer} gameId The ID of the Game
 * 
 * @apiSuccess (201) GAME_COVER_UPDATED Cover of game was deleted.
 * @apiError (404) GAME_NOT_FOUND There is no game with the id <code>gameId</code>
 * @apiError (403) AUTHENTICATION_BANNED Your account was banned. (Reason included in body)
 * @apiError (403) AUTHENTICATION_WRONG You are not allowed to perform this action.
 * @apiError (403) AUTHENTICATION_NEEDED You are not allowed to perform this action.
 */
async function deleteOneCoverHandler(req, res) {
    if(isDev) console.log(chalk.grey("[mgg-server] (Games) Games->DeleteCover"));

    if(req.params.gameid === '') {
        res.status(400).json({name: "MISSING_FIELDS", text: "Required fields: gameId"});
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

    deleteGameCover( game ).then(() => {
        res.status(200).json({name: "GAME_COVER_UPDATED", text: "Cover of game was deleted."});
        return;
    }).catch((error) => {
        console.log(error);
        res.status(500).json({name: "UNKNOWN_ERROR", text: "Cover could not be deleted."});
        return;
    });
}

module.exports = router;