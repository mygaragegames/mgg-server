const express = require('express');
const router = express.Router();
const chalk = require('chalk');
const auth = require('../../middlewares/auth');
const { User, Game } = require('../../sequelize');
const { getOnePlaylist, createPlaylist, updatePlaylist, deletePlaylist } = require('../../src/playlists');

router.route('/')
    .post(auth.verifyToken, postOneHandler);

router.route('/:playlistid')
    .get(getOneHandler)
    .put(auth.verifyToken, putOneHandler)
    .delete(auth.verifyToken, deleteOneHandler);

async function getOneHandler(req, res) {
    console.log(chalk.grey("[mgg-server] (Playlists) Playlists->Get"));

    if(req.params.playlistid == undefined) {
        res.status(400).json({name: "MISSING_DATA", text: "Required parameter: playlistid"});
        return;
    }

    let playlistDetail = await getOnePlaylist({ id: parseInt(req.params.playlistid) }).catch(() => { return null; });
    if(playlistDetail === null) {
        res.status(404).json({name: "PLAYLIST_NOT_FOUND", text: "There is no playlist with the id " + req.params.playlistid});
        return;
    }

    res.status(200).json(playlistDetail);
}
async function postOneHandler(req, res) {
    console.log(chalk.grey("[mgg-server] (Playlists) Playlists->Post"));

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
async function putOneHandler(req, res) {
    console.log(chalk.grey("[mgg-server] (Playlists) Playlists->Put"));

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
        res.status(404).json({name: "PLAYLIST_NOT_FOUND", text: "There is no playlist with the id " + req.params.playlistid});
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
async function deleteOneHandler(req, res) {
    console.log(chalk.grey("[mgg-server] (Playlists) Playlists->Delete"));

    let playlist = await getOnePlaylist({ id: parseInt(req.params.playlistid) }).catch(() => { return null; });
    if(playlist === null) {
        res.status(404).json({name: "PLAYLIST_NOT_FOUND", text: "There is no playlist with the id " + req.params.playlistid});
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

module.exports = router;