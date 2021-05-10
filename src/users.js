const bcrypt = require('bcrypt');
const chalk = require('chalk');
const fs = require("fs");
const readChunk = require('read-chunk');
const imageType = require('image-type');
const uniqid = require('uniqid');
const path = require("path");
const { User } = require('../sequelize');

function getAllUsers() {
    return new Promise((resolve, reject) => {
        User.findAll().then((users) => {
            let output = [];

            users.forEach((user) => {
                let publicUser = user;

                // remove security related fields
                publicUser.password = undefined;
                publicUser.email = undefined;

                output.push(publicUser);
            });

            resolve(output);
        });
    });
}

function getOneUser( searchOptions ) {
    return new Promise((resolve, reject) => {
        User.findOne({ where: searchOptions}).then((userData) => {
            if(userData === null){
                reject(404);
                return;
            }

            // remove security related fields
            userData.password = undefined;
            userData.email = undefined;

            resolve(userData);
        });
    });
}

function createUser( data ) {
    return new Promise((resolve, reject) => {
        bcrypt.hash(data.password, 12)
            .then(function(passwordHash) {
                data.password = passwordHash;

                User.create(data).then((userData) => {
                    // remove security related fields
                    userData.password = undefined;
                    userData.email = undefined;

                    resolve(userData);
                }).catch(function(error) {
                    if(error.name === 'SequelizeUniqueConstraintError') {
                        reject(409);
                    } else {
                        reject(error);
                    }
                });
            });
    });
}

function updateUser( userID, data ) {
    return new Promise((resolve, reject) => {
        resolve();
    });
}

function deleteUser( userID ) {
    return new Promise((resolve, reject) => {
        resolve();
    });
}

function setAvatar( user, avatarFile ) {
    return new Promise((resolve, reject) => {
        if(user === null){
            reject(404);
            return;
        }

        // Filetype Check
        let avatarImageBuffer = readChunk.sync(avatarFile.path, 0, 12);
        let avatarImageType = imageType(avatarImageBuffer);

        // Ignore non-images
        if(avatarImageType === null) {
            return;
        }

        // Only allow PNG & JPG images
        if(avatarImageType.mime !== "image/jpeg" && avatarImageType.mime !== "image/png") {
            return;
        }

        let newImageName = uniqid() + "." + avatarImageType.ext;
        let newImagePath = path.join("./public/avatars/" + newImageName);
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

function removeAvatar( user ) {
    return new Promise((resolve, reject) => {
        if(user === null){
            reject(404);
            return;
        }

        let imagePath = path.join("./public/avatars/" + user.avatarFileName);
        
        // remove physical file
        fs.unlinkSync(imagePath);

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
    deleteUser,
    setAvatar,
    removeAvatar,
}