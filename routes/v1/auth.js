const express = require('express');
const router = express.Router();
const chalk = require('chalk');

const { User, UserRole, ROLES } = require('../../sequelize');
const { login } = require('../../src/auth');

router.route('/login')
    .post(getLoginHandler);

async function getLoginHandler(req, res) {
    console.log(chalk.grey("[mgg-server] (Auth) Auth->Login"));

    if(req.body.username === '' || req.body.password === '') {
        res.status(400).json({name: "MISSING_FIELDS", text: "Required fields: username, password"});
        return;
    }

    // TODO: Check for Authentication and if user has access to game

    login(req.body.username, req.body.password).then((userData) => {
        res.status(200).json(userData);
        return;
    }).catch((error) => {
        if(error === 404) {
            res.status(404).json({name: "USER_NOT_FOUND", text: "There is no user with the username " + req.body.username});
            return;
        } if(error === 403) {
            res.status(403).json({name: "AUTHENTICATION_WRONG", text: "Password is not correct."});
            return;
        } else {
            res.status(500).json({name: "UNKNOWN_ERROR", text: "Could not login."});
            return;
        }
    });
}

module.exports = router;