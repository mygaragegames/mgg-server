const express = require('express');
const router = express.Router();
const chalk = require('chalk');
const auth = require('../../middlewares/auth');
const { User, Game } = require('../../sequelize');
const { parseAvatar, parseGameCover } = require('../../src/parsers');
const { getOnePlaylist, createPlaylist, updatePlaylist, deletePlaylist } = require('../../src/playlists');

let isDev = process.env.NODE_ENV !== 'prod';

router.route('/')
    .post(auth.verifyToken, postOneHandler);

router.route('/:playlistid')
    .get(getOneHandler)
    .put(auth.verifyToken, putOneHandler)
    .delete(auth.verifyToken, deleteOneHandler);

router.route('/:playlistid/add/:gameid')
    .post(auth.verifyToken, postAddHandler);

router.route('/:playlistid/delete/:gameid')
    .delete(auth.verifyToken, deleteRemoveHandler);

/**
 * @api {get} /playlists/:playlistId Get detailled information data from a Playlist
 * @apiName GetOnePlaylist
 * @apiGroup Playlists
 * @apiPermission User
 * @apiPermission Moderator
 * @apiPermission Admin
 * 
 * @apiHeader {String} x-access-token JWT Token for authentication
 * @apiParam {Integer} playlistId The ID of the Playlist
 * 
 * @apiSuccess (200) {Integer} id ID
 * @apiSuccess (200) {String} title Title
 * @apiSuccess (200) {DateTime} createAt DateTime of creation
 * @apiSuccess (200) {DateTime} updatedAt DateTime of last change
 * @apiSuccess (200) {Integer} userId ID of the User who created the playlist
 * @apiSuccess (200) {Object} user Object of the User who created the playlist
 * @apiSuccess (200) {Array} games Array of Games in the Playlist
 * @apiError (404) PLAYLIST_NOT_FOUND There is no playlist with the id <code>playlistId</code>
 */
async function getOneHandler(req, res) {
    if(isDev) console.log(chalk.grey("[mgg-server] (Playlists) Playlists->Get"));

    if(req.params.playlistid == undefined) {
        res.status(400).json({name: "MISSING_DATA", text: "Required parameter: playlistid"});
        return;
    }

    let playlistDetail = await getOnePlaylist({ id: parseInt(req.params.playlistid) }).catch(() => { return null; });
    if(playlistDetail === null) {
        res.status(404).json({name: "PLAYLIST_NOT_FOUND", text: `There is no playlist with the id ${req.params.playlistid}`});
        return;
    }
    
    playlistDetail.user.password = undefined;
    playlistDetail.user.email = undefined;
    playlistDetail.user.loginDiscord = undefined;
    playlistDetail.user.loginTwitter = undefined;
    playlistDetail.user.loginYouTube = undefined;
    playlistDetail.user.avatarFileName = parseAvatar(playlistDetail.user.avatarFileName);

    playlistDetail.games.forEach(game => {
        game.coverFileName = parseGameCover(game.coverFileName);
        
        game.user.password = undefined;
        game.user.email = undefined;
        game.user.loginDiscord = undefined;
        game.user.loginTwitter = undefined;
        game.user.loginYouTube = undefined;
        game.user.avatarFileName = parseAvatar(game.user.avatarFileName);
    });

    res.status(200).json(playlistDetail);
}

/**
 * @api {post} /playlists Creates a Playlist
 * @apiName CreatePlaylist
 * @apiGroup Playlists
 * @apiPermission User
 * 
 * @apiHeader {String} x-access-token JWT Token for authentication
 * @apiParam {String} title Title of the Playlist
 * 
 * @apiSuccess (201) {Integer} id ID
 * @apiSuccess (201) {String} title Title
 * @apiSuccess (201) {DateTime} createAt DateTime of creation
 * @apiSuccess (201) {DateTime} updatedAt DateTime of last change
 * @apiSuccess (201) {Integer} userId ID of the User who created the playlist
 * @apiError (403) AUTHENTICATION_BANNED Your account was banned. (Reason included in body)
 * @apiError (403) AUTHENTICATION_WRONG You are not allowed to perform this action.
 * @apiError (403) AUTHENTICATION_NEEDED You are not allowed to perform this action.
 */
async function postOneHandler(req, res) {
    if(isDev) console.log(chalk.grey("[mgg-server] (Playlists) Playlists->Post"));

    const data = {
        title: req.body.title,
        userId: req.user.id
    };

    if(data.title === '') {
        res.status(400).json({name: "MISSING_FIELDS", text: "Required fields: title"});
        return;
    }

    createPlaylist( data ).then((playlist) => {
        res.status(201).json( playlist );
    }).catch((error) => {
        res.status(500).json({name: "UNKNOWN_SERVER_ERROR", text: "Unknown Server Error! Please try again later!"});
    });
}

/**
 * @api {put} /playlists/:playlistId Updates a Playlist
 * @apiName UpdatePlaylist
 * @apiGroup Playlists
 * @apiPermission User
 * @apiPermission Moderator
 * @apiPermission Admin
 * 
 * @apiHeader {String} x-access-token JWT Token for authentication
 * @apiParam {Integer} playlistId The ID of the Playlist
 * @apiParam {String} title New title of the Playlist
 * 
 * @apiSuccess (201) PLAYLIST_UPDATED Playlist was updated.
 * @apiError (404) PLAYLIST_NOT_FOUND There is no playlist with the id <code>playlistId</code>
 * @apiError (403) AUTHENTICATION_BANNED Your account was banned. (Reason included in body)
 * @apiError (403) AUTHENTICATION_WRONG You are not allowed to perform this action.
 * @apiError (403) AUTHENTICATION_NEEDED You are not allowed to perform this action.
 */
async function putOneHandler(req, res) {
    if(isDev) console.log(chalk.grey("[mgg-server] (Playlists) Playlists->Put"));

    const data = {
        id: req.params.playlistid,
        title: req.body.title,
        userId: req.user.id
    };

    if(data.title === '') {
        res.status(400).json({name: "MISSING_FIELDS", text: "Required fields: title"});
        return;
    }

    let playlist = await getOnePlaylist({ id: parseInt(req.params.playlistid) }).catch(() => { return null; });
    if(playlist === null) {
        res.status(404).json({name: "PLAYLIST_NOT_FOUND", text: `There is no playlist with the id ${req.params.playlistid}`});
        return;
    }

    // Check if user is owner or moderator/admin
    if(playlist.userId !== req.userId && !req.userRoles.includes('moderator', 'admin')) {
        res.status(403).json({name: "AUTHENTICATION_NEEDED", text: "You are not allowed to perform this action."});
        return;
    }
    
    updatePlaylist( playlist, data ).then((data) => {
        res.status(201).json({name: "PLAYLIST_UPDATED", text: "Playlist was updated."});
        return;
    }).catch((error) => {
        res.status(500).json({name: "UNKNOWN_SERVER_ERROR", text: "Unknown Server Error! Please try again later!"});
    });
}

/**
 * @api {delete} /playlists/:playlistId/ Deletes a Playlist
 * @apiName DeletePlaylist
 * @apiGroup Playlists
 * @apiPermission User
 * @apiPermission Moderator
 * @apiPermission Admin
 * 
 * @apiHeader {String} x-access-token JWT Token for authentication
 * @apiParam {Integer} playlistId The ID of the Playlist
 * 
 * @apiSuccess (200) PLAYLIST_REMOVED Playlist was deleted.
 * @apiError (404) PLAYLIST_NOT_FOUND There is no playlist with the id <code>playlistId</code>
 * @apiError (403) AUTHENTICATION_BANNED Your account was banned. (Reason included in body)
 * @apiError (403) AUTHENTICATION_WRONG You are not allowed to perform this action.
 * @apiError (403) AUTHENTICATION_NEEDED You are not allowed to perform this action.
 */
async function deleteOneHandler(req, res) {
    if(isDev) console.log(chalk.grey("[mgg-server] (Playlists) Playlists->Delete"));

    let playlist = await getOnePlaylist({ id: parseInt(req.params.playlistid) }).catch(() => { return null; });
    if(playlist === null) {
        res.status(404).json({name: "PLAYLIST_NOT_FOUND", text: `There is no playlist with the id ${req.params.playlistid}`});
        return;
    }

    // Check if user is owner or moderator/admin
    if(playlist.userId !== req.userId && !req.userRoles.includes('moderator', 'admin')) {
        res.status(403).json({name: "AUTHENTICATION_NEEDED", text: "You are not allowed to perform this action."});
        return;
    }

    deletePlaylist( playlist ).then((data) => {
        res.status(200).json({name: "PLAYLIST_DELETED", text: "Playlist was deleted."});
        return;
    }).catch((error) => {
        res.status(500).json({name: "UNKNOWN_SERVER_ERROR", text: "Unknown Server Error! Please try again later!"});
    });
}

/**
 * @api {post} /playlists/:playlistId/add/:gameId Adds a Game to a Playlist
 * @apiName AddToPlaylist
 * @apiGroup Playlists
 * @apiPermission User
 * 
 * @apiHeader {String} x-access-token JWT Token for authentication
 * @apiParam {Integer} playlistId The ID of the Playlist
 * @apiParam {Integer} gameId The ID of the Game
 * 
 * @apiSuccess (201) PLAYLIST_GAME_ADDED Game was added to playlist.
 * @apiError (404) PLAYLIST_NOT_FOUND There is no playlist with the id <code>playlistId</code>
 * @apiError (404) GAME_NOT_FOUND There is no game with the id <code>gameId</code>
 * @apiError (409) PLAYLIST_GAME_CONFLICT Game is already in playlist.
 * @apiError (403) AUTHENTICATION_BANNED Your account was banned. (Reason included in body)
 * @apiError (403) AUTHENTICATION_WRONG You are not allowed to perform this action.
 * @apiError (403) AUTHENTICATION_NEEDED You are not allowed to perform this action.
 */
async function postAddHandler(req, res) {
    if(isDev) console.log(chalk.grey("[mgg-server] (Playlists) Playlists->AddGame"));

    let playlist = await getOnePlaylist({ id: parseInt(req.params.playlistid) }).catch(() => { return null; });
    if(playlist === null) {
        res.status(404).json({name: "PLAYLIST_NOT_FOUND", text: `There is no playlist with the id ${req.params.playlistid}`});
        return;
    }

    // Check if user is owner or moderator/admin
    if(playlist.userId !== req.userId && !req.userRoles.includes('moderator', 'admin')) {
        res.status(403).json({name: "AUTHENTICATION_NEEDED", text: "You are not allowed to perform this action."});
        return;
    }

    playlist.addGame(req.params.gameid).then((data) => {
        res.status(201).json({name: "PLAYLIST_GAME_ADDED", text: "Game was added to playlist."});
    }).catch((error) => {
        if(error.name === 'SequelizeUniqueConstraintError') {
            res.status(409).json({name: "PLAYLIST_GAME_CONFLICT", text: "Game is already in playlist."});
        } else {
            console.error(error);
            res.status(500).json({name: "UNKNOWN_SERVER_ERROR", text: "Unknown Server Error! Please try again later!"});
        }
    });
}

/**
 * @api {delete} /playlists/:playlistId/delete/:gameId Deletes a Game from a Playlist
 * @apiName DeleteFromPlaylist
 * @apiGroup Playlists
 * @apiPermission User
 * 
 * @apiHeader {String} x-access-token JWT Token for authentication
 * @apiParam {Integer} playlistId The ID of the Playlist
 * @apiParam {Integer} gameId The ID of the Game
 * 
 * @apiSuccess (200) PLAYLIST_GAME_REMOVED Game was deleted from playlist.
 * @apiError (404) PLAYLIST_NOT_FOUND There is no playlist with the id <code>playlistId</code>
 * @apiError (403) AUTHENTICATION_BANNED Your account was banned. (Reason included in body)
 * @apiError (403) AUTHENTICATION_WRONG You are not allowed to perform this action.
 * @apiError (403) AUTHENTICATION_NEEDED You are not allowed to perform this action.
 */
async function deleteRemoveHandler(req, res) {
    if(isDev) console.log(chalk.grey("[mgg-server] (Playlists) Playlists->RemoveGame"));

    let playlist = await getOnePlaylist({ id: parseInt(req.params.playlistid) }).catch(() => { return null; });
    if(playlist === null) {
        res.status(404).json({name: "PLAYLIST_NOT_FOUND", text: `There is no playlist with the id ${req.params.playlistid}`});
        return;
    }

    // Check if user is owner or moderator/admin
    if(playlist.userId !== req.userId && !req.userRoles.includes('moderator', 'admin')) {
        res.status(403).json({name: "AUTHENTICATION_NEEDED", text: "You are not allowed to perform this action."});
        return;
    }

    playlist.removeGame(req.params.gameid).then((data) => {
        res.status(200).json({name: "PLAYLIST_GAME_REMOVED", text: "Game was deleted from playlist."});
    }).catch((error) => {
        console.error(error);
        res.status(500).json({name: "UNKNOWN_SERVER_ERROR", text: "Unknown Server Error! Please try again later!"});
    });
}

module.exports = router;