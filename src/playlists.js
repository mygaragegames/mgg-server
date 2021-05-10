const chalk = require('chalk');
const { User, Game, Playlist } = require('../sequelize');

function getOnePlaylist( searchOptions ) {
    return new Promise((resolve, reject) => {
        Playlist.findOne({ where: searchOptions, include: { model: User, as: 'user' }}).then((playlistData) => {
            if(playlistData === null){
                reject(404);
                return;
            }

            // remove security related fields for return
            playlistData.user.password = undefined;
            playlistData.user.email = undefined;

            resolve(playlistData);
        });
    });
}

function createPlaylist( data ) {
    return new Promise((resolve, reject) => {
        Playlist.create(data).then((playlistData) => {
            resolve(playlistData);
        }).catch((error) => {
            reject(error);
        });
    });
}

function updatePlaylist( playlist, newData) {
    return new Promise((resolve, reject) => {
        playlist.update( newData ).then((newPlaylist) => {
            resolve(newPlaylist);
        }).catch((error) => {
            reject(error);
        });
    });
}

function deletePlaylist( playlist ) {
    return new Promise((resolve, reject) => {
        playlist.destroy().then(() => {
            resolve();
        }).catch((error) => {
            reject(error);
        });
    });
}

module.exports = {
    getOnePlaylist,
    createPlaylist,
    updatePlaylist,
    deletePlaylist
}