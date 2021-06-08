const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const chalk = require('chalk');
const path = require("path");
const { User, UserRole, ROLES } = require('../sequelize');
const { isEmailValid } = require('./parsers');
const { getOneUser } = require('./users');

async function login( username, password ) {
    return new Promise((resolve, reject) => {
        getOneUser({ username: username }, 0, []).then((userData) => {
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

async function loginViaMethod( method, id ) {
    return new Promise((resolve, reject) => {
        let userQuery = {};
        switch(method) {
            case "discord":
                userQuery = { loginDiscord: id};
        }

        getOneUser(userQuery, 0, []).then((userData) => {
            if(userData === null) {
                reject(404);
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

async function verify( token ) {   
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET_KEY, (error, decoded) => {
            if(error) {
                reject(403);
            }

            getOneUser( { id: decoded.id}, 0, []).then((userData) => {
                let userRoles = [];

                userData.getRoles().then((roles) => {
                    roles.forEach(role => {
                        userRoles.push(role.name);
                    });
        
                    resolve({
                        userData: userData,
                        token: token,
                        roles: userRoles
                    });
                });
            }).catch(() => {
                reject(403);
            });
        });
    });
}

function update( user, newData ) {
    return new Promise((resolve, reject) => {
        if(newData.email != undefined && newData.email != "") {
            if(!isEmailValid(newData.email)) {
                reject(406);
                return;
            }
        } else {
            newData.email = undefined;
        }

        if(newData.password != undefined && newData.password != "") {
            newData.password = bcrypt.hashSync(newData.password, 12);
        } else {
            newData.password = undefined;
        }

        user.update( newData ).then((newUser) => {
            resolve(newUser);
        }).catch((error) => {
            if(error.name === 'SequelizeUniqueConstraintError') {
                reject(409);
            } else {
                console.error(error);
                reject(error);
            }
        });
    });
}

module.exports = {
    login,
    loginViaMethod,
    verify,
    update,
}