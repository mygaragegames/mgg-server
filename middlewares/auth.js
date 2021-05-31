const chalk = require('chalk');
const jwt = require("jsonwebtoken");
const { getOneUser } = require('../src/users');

let verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"];

    if(token === undefined) {
        return res.status(403).json({name: "AUTHENTICATION_NEEDED", text: "You are not allowed to perform this action."});
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY, (error, decoded) => {
        if(error) {
            return res.status(401).json({name: "AUTHENTICATION_WRONG", text: "You are not allowed to perform this action."});
        }

        getOneUser( { id: decoded.id} ).then((userData) => {
            // Check if user is banned
            if(userData.banActive) {
                res.status(423).json({name: "AUTHENTICATION_BANNED", text: "Your account was banned.", reason: userData.banReason});
                return;
            }

            req.user = userData;
            req.userId = userData.id;
            
            userData.getRoles().then((roles) => {
                req.userRoles = [];

                roles.forEach(role => {
                    req.userRoles.push(role.name);
                });

                next();
            }).catch(() => {
                req.userRoles = [];

                next();
            });
        }).catch((error) => {
            return res.status(401).json({name: "AUTHENTICATION_WRONG", text: "You are not allowed to perform this action."});
        });
    });
}

let optionalToken = (req, res, next) => {
    let token = req.headers["x-access-token"];

    if(token === undefined) {
        req.user = null;
        req.userId = null;
        req.userRoles = [];

        next();
        return;
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY, (error, decoded) => {
        if(error) {
            req.user = null;
            req.userId = null;
            req.userRoles = [];
    
            next();
            return;
        }

        getOneUser( { id: decoded.id} ).then((userData) => {
            // Check if user is banned
            if(userData.banActive) {
                req.user = null;
                req.userId = null;
                req.userRoles = [];
        
                next();
                return;
            }

            req.user = userData;
            req.userId = userData.id;
            
            userData.getRoles().then((roles) => {
                req.userRoles = [];

                roles.forEach(role => {
                    req.userRoles.push(role.name);
                });

                next();
            }).catch(() => {
                req.userRoles = [];

                next();
            });
        }).catch((error) => {
            req.user = null;
            req.userId = null;
            req.userRoles = [];
    
            next();
            return;
        });
    });
}

module.exports = {
    verifyToken,
    optionalToken
}