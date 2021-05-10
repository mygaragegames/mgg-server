const bcrypt = require('bcrypt');
const chalk = require('chalk');
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

const { User, ROLES } = require('../sequelize');
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

module.exports = {
    verifyToken
}