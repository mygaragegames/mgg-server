const chalk = require('chalk');
const { updateUser } = require('./users');

function banUser(user, reason) {
    return new Promise((resolve, reject) => {
        updateUser( user, {
            banActive: true,
            banReason: reason
        }).then(() => {
            resolve(201);
            return;
        }).catch((error) => {
            reject(error);
        });
    });
}

function unbanUser(user) {
    return new Promise((resolve, reject) => {
        updateUser( user, {
            banActive: false,
            banReason: ""
        }).then(() => {
            resolve(201);
            return;
        }).catch((error) => {
            reject(error);
        });
    });
}

module.exports = {
    banUser,
    unbanUser
}