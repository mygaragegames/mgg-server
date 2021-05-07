const bcrypt = require('bcrypt');
const chalk = require('chalk');
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

module.exports = {
    createUser,
    getAllUsers,
    getOneUser,
    updateUser,
    deleteUser
}