const express = require('express');
const router = express.Router();
const chalk = require('chalk');
const auth = require('../../middlewares/auth');
const { getOneUser } = require('../../src/users');
const { banUser, unbanUser } = require('../../src/modBan');

let isDev = process.env.NODE_ENV !== 'prod';

router.route('/:userid')
    .put(auth.verifyToken, putBanHandler)
    .delete(auth.verifyToken, deleteBanHandler);

/**
 * @api {put} /ban/:userId Bans a User
 * @apiName BanUser
 * @apiGroup Moderation
 * @apiPermission User
 * @apiPermission Moderator
 * @ApiPermission Admin
 * 
 * @apiHeader {String} x-access-token JWT Token for authentication
 * @apiParam {Integer} userId The ID of the User
 * @apiParam {String} reason Ban reason (displayed to user)
 * 
 * @apiSuccess (201) USER_UPDATED User was banned.
 * @apiError (404) USER_NOT_FOUND There is no user with the id <code>userId</code>
 * @apiError (403) AUTHENTICATION_BANNED Your account was banned. (Reason included in body)
 * @apiError (403) AUTHENTICATION_WRONG You are not allowed to perform this action.
 * @apiError (403) AUTHENTICATION_NEEDED You are not allowed to perform this action.
 */
async function putBanHandler(req, res) {
    if(isDev) console.log(chalk.grey("[mgg-server] (Moderation) Ban->Put"));

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

    banUser(user, req.body.reason).then(() => {
        res.status(201).json({name: "USER_UPDATED", text: "User was banned."});
    }).catch((error) => {
        switch(error) {
            default:
                console.log(error);
                res.status(500).json({name: "UNKNOWN_ERROR", text: "User could not be banned."});
                return;
        }
    });
}

/**
 * @api {delete} /ban/:userId Deletes the ban of a User
 * @apiName UnbanUser
 * @apiGroup Moderation
 * @apiPermission Moderator
 * @ApiPermission Admin
 * 
 * @apiHeader {String} x-access-token JWT Token for authentication
 * @apiParam {Integer} userId The ID of the User
 * 
 * @apiSuccess (201) USER_UPDATED User was unbanned.
 * @apiError (404) USER_NOT_FOUND There is no user with the id <code>userId</code>
 * @apiError (403) AUTHENTICATION_BANNED Your account was banned. (Reason included in body)
 * @apiError (403) AUTHENTICATION_WRONG You are not allowed to perform this action.
 * @apiError (403) AUTHENTICATION_NEEDED You are not allowed to perform this action.
 */
async function deleteBanHandler(req, res) {
    if(isDev) console.log(chalk.grey("[mgg-server] (Moderation) Ban->Delete"));

    let user = await getOneUser({ id: parseInt(req.params.userid) }).catch(() => { return null; });
    if(user === null) {
        res.status(404).json({name: "USER_NOT_FOUND", text: `There is no user with the id ${req.params.userid}`});
        return;
    }

    // Check if user is moderator/admin
    if(!['moderator', 'admin'].some(str => req.userRoles.includes(str))) {
        res.status(403).json({name: "AUTHENTICATION_NEEDED", text: "You are not allowed to perform this action."});
        return;
    }

    unbanUser(user).then(() => {
        res.status(201).json({name: "USER_UPDATED", text: "User was unbanned."});
    }).catch((error) => {
        switch(error) {
            default:
                console.log(error);
                res.status(500).json({name: "UNKNOWN_ERROR", text: "User could not be unbanned."});
                return;
        }
    });
}

module.exports = router;