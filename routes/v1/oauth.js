const express = require('express');
const router = express.Router();
const chalk = require('chalk');
const auth = require('../../middlewares/auth');
const { getDiscordUri, processDiscordCallback } = require('../../src/oauth');

let isDev = process.env.NODE_ENV !== 'prod';

router.route('/discord')
    .get(getDiscordHandler);
router.route('/discord/callback')
    .post(postDiscordCallbackHandler);

/**
 * @api {get} /oauth/discord Receive the correct OAuth login URL
 * @apiName OauthDiscordGetUrl
 * @apiGroup Auth
 * 
 * @apiSuccess (200) {string} url The URL for the OAuth login flow
 */
async function getDiscordHandler(req, res) {
    if(isDev) console.log(chalk.grey("[mgg-server] (Auth) OAuth->DiscordGetUri"));

    res.status(200).json({url: getDiscordUri()});
}

/**
 * @api {post} /oauth/discord/callback Login a user with the received OAuth Code
 * @apiName OauthDiscordCallback
 * @apiGroup Auth
 * 
 * @apiParam {String} callbackCode The received OAuth code
 * 
 * @apiSuccess (200) {Object} userData Object of the authenticated User
 * @apiSuccess (200) {String} token JWT Token for authenticated calls
 * @apiSuccess (200) {Array} roles Roles of the authenticated User
 * @apiError (409) USERNAME_EMAIL_CONFLICT Username or email is already in use!
 * @apiError (403) AUTHENTICATION_BANNED Your account was banned. (Reason included in body)
 */
async function postDiscordCallbackHandler(req, res) {
    if(isDev) console.log(chalk.grey("[mgg-server] (Auth) OAuth->DiscordCallback"));

    if(req.body.callbackCode === undefined) {
        res.status(400).json({name: "MISSING_FIELDS", text: "Required fields: callbackCode"});
        return;
    }

    try {
        let discordResponse = await processDiscordCallback(req.body.callbackCode);

        discordResponse.userData.password = undefined;
        discordResponse.userData.avatarFileName = parseAvatar(discordResponse.userData.avatarFileName);

        if(loginData.userData.banActive) {
            res.status(401).json({name: "AUTHENTICATION_BANNED", text: "Your account was banned.", reason: loginData.userData.banReason});
            return;
        }

        res.status(200).json(discordResponse);
    } catch(error) {
        switch(error) {
            case 500:
            default:
                console.error(error);
                res.status(500).json({name: "UNKNOWN_SERVER_ERROR", text: "Unknown Server Error! Please try again later!"});
                return;
            case 409:
                res.status(409).json({name: "USERNAME_EMAIL_CONFLICT", text: "Username or email is already in use!"});
                return;
        }
    }
}

module.exports = router;