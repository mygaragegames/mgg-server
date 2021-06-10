const express = require('express');
const router = express.Router();
const chalk = require('chalk');
const auth = require('../../middlewares/auth');
const { parseAvatar, isEmailValid } = require('../../src/parsers');
const { login, verify, update } = require('../../src/auth');
const { getOneUser } = require('../../src/users');

let isDev = process.env.NODE_ENV !== 'prod';

router.route('/login')
    .post(postLoginHandler);

router.route('/verify')
    .post(postVerifyHandler);

router.route('/update/:userid')
    .put(auth.verifyToken, putUpdateHandler);

/**
 * @api {post} /auth/login Login a User
 * @apiName AuthLogin
 * @apiGroup Auth
 * @apiPermission Public
 * 
 * @apiParam {String} username Username
 * @apiParam {String} password Password
 * 
 * @apiSuccess (200) {Object} userData Object of the authenticated User
 * @apiSuccess (200) {String} token JWT Token for authenticated calls
 * @apiSuccess (200) {Array} roles Roles of the authenticated User
 * @apiError (404) USER_NOT_FOUND There is no user with the username <code>username</code>
 * @apiError (403) AUTHENTICATION_BANNED Your account was banned. (Reason included in body)
 * @apiError (403) AUTHENTICATION_WRONG Password is not correct
 */
async function postLoginHandler(req, res) {
    if(isDev) console.log(chalk.grey("[mgg-server] (Auth) Auth->Login"));

    if(req.body.username === '' || req.body.password === '') {
        res.status(400).json({name: "MISSING_FIELDS", text: "Required fields: username, password"});
        return;
    }

    login(req.body.username, req.body.password).then((loginData) => {
        // remove security related fields for return
        loginData.userData.password = undefined;
        loginData.userData.avatarFileName = parseAvatar(loginData.userData.avatarFileName);

        if(loginData.userData.banActive) {
            res.status(401).json({name: "AUTHENTICATION_BANNED", text: "Your account was banned.", reason: loginData.userData.banReason});
            return;
        }

        res.status(200).json(loginData);
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

/**
 * @api {post} /auth/verify Verifies a JWT token
 * @apiName AuthVerify
 * @apiGroup Auth
 * @apiPermission Public
 * 
 * @apiParam {String} token JWT Token
 * 
 * @apiSuccess (200) {Object} userData Object of the authenticated User
 * @apiSuccess (200) {String} token JWT Token for authenticated calls
 * @apiSuccess (200) {Array} roles Roles of the authenticated User
 * @apiError (403) AUTHENTICATION_BANNED Your account was banned. (Reason included in body)
 * @apiError (403) AUTHENTICATION_WRONG Token is invalid
 */
async function postVerifyHandler(req, res) {
    if(isDev) console.log(chalk.grey("[mgg-server] (Auth) Auth->Verify"));

    if(req.body.token === '') {
        res.status(400).json({name: "MISSING_FIELDS", text: "Required fields: token"});
        return;
    }

    verify(req.body.token).then((verifyData) => {
        // remove security related fields for return
        verifyData.userData.password = undefined;
        verifyData.userData.avatarFileName = parseAvatar(verifyData.userData.avatarFileName);

        if(verifyData.userData.banActive) {
            res.status(401).json({name: "AUTHENTICATION_BANNED", text: "Your account was banned.", reason: verifyData.userData.banReason});
            return;
        }
        
        res.status(200).json(verifyData);
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

/**
 * @api {put} /auth/update/:userid Updates a Users email/password
 * @apiName AuthUpdate
 * @apiGroup Auth
 * @apiPermission User
 * @apiPermission Moderator
 * @apiPermission Admin
 * 
 * @apiHeader {String} x-access-token JWT Token for authentication
 * @apiParam {String} userid The ID of the User
 * @apiParam {String} email [Optional] New email for User
 * @apiParam {String} password [Optional] New password for User
 * 
 * @apiSuccess (201) USER_UPDATED User was updated.
 * @apiError (404) USER_NOT_FOUND There is no user with the id <code>id</code>
 * @apiError (406) EMAIL_INVALID Email is not valid!
 * @apiError (409) USERNAME_EMAIL_CONFLICT Username or email is already in use!
 * @apiError (403) AUTHENTICATION_BANNED Your account was banned. (Reason included in body)
 * @apiError (403) AUTHENTICATION_WRONG You are not allowed to perform this action.
 * @apiError (403) AUTHENTICATION_NEEDED You are not allowed to perform this action.
 */
async function putUpdateHandler(req, res) {
    if(isDev) console.log(chalk.grey("[mgg-server] (Auth) Auth->Update"));

    if(req.params.userid === '') {
        res.status(400).json({name: "MISSING_FIELDS", text: "Required fields: userId"});
        return;
    }

    let user = await getOneUser({ id: parseInt(req.params.userid) }).catch(() => { return null; });
    if(user === null) {
        res.status(404).json({name: "USER_NOT_FOUND", text: `There is no user with the id ${req.params.userid}`});
        return;
    }

    // Check if user is owner or moderator/admin
    if(user.id !== req.userId && !['moderator', 'admin'].some(str => req.userRoles.includes(str))) {
        res.status(403).json({name: "AUTHENTICATION_NEEDED", text: "You are not allowed to perform this action."});
        return;
    }

    let updatePayload = {};
    if(req.body.email != undefined) {
        updatePayload.email = req.body.email;
    }
    if(req.body.password != undefined) {
        updatePayload.password = req.body.password;
    }

    update(user, updatePayload).then(() => {
        res.status(201).json({name: "USER_UPDATED", text: "User was updated."});
        return;
    }).catch((error) => {
        switch(error) {
            case 500:
            default:
                console.error(error);
                res.status(500).json({name: "UNKNOWN_ERROR", text: "User could not be updated."});
                return;
            case 404:
                res.status(404).json({name: "USER_NOT_FOUND", text: `There is no user with the id ${req.params.userid}`});
                return;
            case 406:
                res.status(406).json({name: "EMAIL_INVALID", text: "Email is not valid!"});
                return;
            case 409:
                res.status(409).json({name: "USERNAME_EMAIL_CONFLICT", text: "Username or email is already in use!"});
                return;
            case 403:
                res.status(403).json({name: "AUTHENTICATION_WRONG", text: "Password is not correct."});
                return;
        }
    });
}

module.exports = router;