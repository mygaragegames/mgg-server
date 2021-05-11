const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const chalk = require('chalk');
const path = require("path");
const { User, UserRole, ROLES } = require('../sequelize');
const { getOneUser } = require('./users');

async function login( username, password ) {
    return new Promise((resolve, reject) => {
        getOneUser({ username: username }).then((userData) => {
            if(userData === null) {
                reject(404);
                return;
            }

            if(!bcrypt.compareSync(password, userData.password)) {
                reject(403);
                return;
            }

            let newToken = jwt.sign({ id: userData.id }, process.env.JWT_SECRET_KEY, {
                expiresIn: 86400
            });

            let userRoles = []
            userData.getRoles().then((roles) => {
                roles.forEach(role => {
                    userRoles.push(role.name);
                });

                // remove security related fields for return
                userData.password = undefined;
    
                resolve({
                    userData: userData,
                    token: newToken,
                    roles: userRoles
                });
            });
        }).catch((error) => {
            reject(error);
            return;
        });
    });
}

module.exports = {
    login,
}