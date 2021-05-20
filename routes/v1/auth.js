const express = require('express');
const router = express.Router();
const chalk = require('chalk');
const { parseAvatar } = require('../../src/parsers');
const { login, verify } = require('../../src/auth');

router.route('/login')
    .post(postLoginHandler);

router.route('/verify')
    .post(postVerifyHandler);

async function postLoginHandler(req, res) {
    console.log(chalk.grey("[mgg-server] (Auth) Auth->Login"));

    if(req.body.username === '' || req.body.password === '') {
        res.status(400).json({name: "MISSING_FIELDS", text: "Required fields: username, password"});
        return;
    }

    login(req.body.username, req.body.password).then((userData) => {
        // remove security related fields for return
        userData.password = undefined;
        userData.avatarFileName = parseAvatar(userData.avatarFileName);

        res.status(200).json(userData);
        return;
    }).catch((error) => {
        if(error === 404) {
            res.status(404).json({name: "USER_NOT_FOUND", text: `There is no user with the username ${req.body.username}`});
            return;
        } else if(error === 403) {
            res.status(403).json({name: "AUTHENTICATION_WRONG", text: "Password is not correct."});
            return;
        } else {
            res.status(500).json({name: "UNKNOWN_ERROR", text: "Could not login."});
            return;
        }
    });
}

async function postVerifyHandler(req, res) {
    console.log(chalk.grey("[mgg-server] (Auth) Auth->Verify"));

    if(req.body.token === '') {
        res.status(400).json({name: "MISSING_FIELDS", text: "Required fields: token"});
        return;
    }

    verify(req.body.token).then((userData) => {
        // remove security related fields for return
        userData.password = undefined;
        userData.avatarFileName = parseAvatar(userData.avatarFileName);
        
        res.status(200).json(userData);
        return;
    }).catch((error) => {
        if(error === 403) {
            res.status(403).json({name: "AUTHENTICATION_WRONG", text: "Token is invalid."});
            return;
        } else {
            res.status(500).json({name: "UNKNOWN_ERROR", text: "Could not login."});
            return;
        }
    });
}

module.exports = router;