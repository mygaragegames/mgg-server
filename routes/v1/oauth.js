const express = require('express');
const router = express.Router();
const chalk = require('chalk');
const auth = require('../../middlewares/auth');
const { getDiscordUri, processDiscordCallback } = require('../../src/oauth');

let isDev = process.env.NODE_ENV !== 'prod';

router.route('/discord')
    .get(getDiscordHandler);
router.route('/discord/callback')
    .get(getDiscordCallbackHandler);

async function getDiscordHandler(req, res) {
    res.redirect(getDiscordUri());
}

async function getDiscordCallbackHandler(req, res) {
    if(isDev) console.log(chalk.grey("[mgg-server] (Auth) OAuth->Discord"));

    console.log(req.query);

    /* let oauthCode = req.query.code;
    if(oauthCode == undefined) {
        res.status(403).json({name: "AUTHENTICATION_NEEDED", text: "You are not allowed to perform this action."});
        return;
    } */

    try {
        let discordResponse = await processDiscordCallback(req.originalUrl);

        res.status(200).json(discordResponse);
    } catch(error) {
        console.error(error);
        res.status(500).json();
    }
}

module.exports = router;