const chalk = require('chalk');
const { User, Game, Playlist } = require('../sequelize');

function getOnePlaylist( searchOptions, userId = 0, userRoles = []) {
    let overrideDisplayStatus = userRoles.includes('moderator', 'admin');

    // TODO: Fix honoring displayStatus

    return new Promise((resolve, reject) => {
        Playlist.findOne({
                where: searchOptions,
                include: [
                    {
                        model: User,
                        as: 'user',
                    },
                    {
                        model: Game,
                        as: "games",
                        include: { model: User, as: "user" },
                        order: [
                            ['games.createdAt', 'DESC']
                        ],
                    }
                ]
        }).then((playlistData) => {
            if(playlistData === null){
                reject(404);
                return;
            }

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