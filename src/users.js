const bcrypt = require('bcrypt');
const chalk = require('chalk');
const fs = require("fs");
const readChunk = require('read-chunk');
const imageType = require('image-type');
const uniqid = require('uniqid');
const path = require("path");
const { User, Playlist, Game, GameComment } = require('../sequelize');
const { isUsernameValid, isCreatorIDValid } = require('./parsers');
const { deleteGame } = require('./games');
const { deleteGameComment } = require('./gameComments');
const { deletePlaylist } = require('./playlists');

function getAllUsers() {
    return new Promise((resolve, reject) => {
        User.findAll({
            order: [
                [ 'createdAt', 'ASC']
            ]
        }).then((users) => {
            let output = [];

            users.forEach((user) => {
                let publicUser = user;

                output.push(publicUser);
            });

            resolve(output);
        });
    });
}

function getOneUser( searchOptions ) {
    return new Promise((resolve, reject) => {
        User.findOne({
            where: searchOptions,
            include: [
                { model: Playlist, as: "playlists" },
                { model: GameComment, as: "comments", include: { model: User, as: "user" } },
                { model: Game, as: "games", include: { model: User, as: "user" } }
            ],
            order: [
                [{ model: Game, as: "games" }, 'createdAt', 'DESC']
            ]
        }).then((userData) => {
            if(userData === null){
                reject(404);
                return;
            }

            resolve(userData);
        });
    });
}

function createUser( data ) {
    return new Promise((resolve, reject) => {
        data.password = bcrypt.hashSync(data.password, 12);

        if(!isUsernameValid(data.username)) {
            reject(418);
            return;
        }

        if(data.ingameID != undefined && !isCreatorIDValid(data.ingameID)) {
            reject(400);
            return;
        }

        User.create(data).then((userData) => {
            // Give user role
            userData.setRoles([1]);

            Playlist.create({
                title: "Play later",
                userId: userData.id
            }).then(() => {
                resolve(userData);
            }).catch((error) => {
                reject(error);
            });
        }).catch((error) => {
            if(error.name === 'SequelizeUniqueConstraintError') {
                reject(409);
            } else {
                reject(error);
            }
        });
    });
}

function updateUser( user, newData ) {
    return new Promise((resolve, reject) => {
        newData.avatarFileName = undefined;
        newData.email = undefined;

        if(newData.password != undefined) {
            newData.password = bcrypt.hashSync(newData.password, 12);
        }

        if(newData.ingameID != undefined && !isCreatorIDValid(newData.ingameID)) {
            reject(400);
            return;
        }

        user.update( newData ).then((newUser) => {
            resolve(newUser);
        }).catch((error) => {
            reject(error);
        });
    });
}

function setAvatar( user, avatarFile ) {
    return new Promise((resolve, reject) => {
        if(user === null){
            reject(404);
            return;
        }

        // Remove previous avatars if existing
        if(user.avatarFileName !== null) {
            let imagePath = path.join(`./public/avatars/${user.avatarFileName}`);
            try {
                fs.unlinkSync(imagePath);
            } catch(error) {}
            user.avatarFile = null;
        }

        // Filetype Check
        let avatarImageBuffer = readChunk.sync(avatarFile.path, 0, 12);
        let avatarImageType = imageType(avatarImageBuffer);

        // Ignore non-images
        if(avatarImageType === null) {
            reject(400);
            return;
        }

        // Only allow PNG & JPG images
        if(avatarImageType.mime !== "image/jpeg" && avatarImageType.mime !== "image/png") {
            reject(400);
            return;
        }

        let newImageName = uniqid() + "." + avatarImageType.ext;
        let newImagePath = path.join(`./public/avatars/${newImageName}`);
        fs.renameSync(avatarFile.path, newImagePath);

        user.update({
            avatarFileName: newImageName
        }).then(() => {
            resolve();
        }).catch((error) => {
            fs.unlinkSync(newImagePath);
            reject(error);
        });
    });
}

function deleteAvatar( user ) {
    return new Promise((resolve, reject) => {
        if(user === null){
            reject(404);
            return;
        }

        let imagePath = path.join(`./public/avatars/${user.avatarFileName}`);
        
        // remove physical file
        try {
            fs.unlinkSync(imagePath);
        } catch(error) {}

        user.update({
            avatarFile: null
        }).then(() => {
            resolve();
        }).catch((error) => {
            reject(error);
        });
    });
}

module.exports = {
    createUser,
    getAllUsers,
    getOneUser,
    updateUser,
    setAvatar,
    deleteAvatar,
}