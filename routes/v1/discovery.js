const express = require('express');
const router = express.Router();
const chalk = require('chalk');
const auth = require('../../middlewares/auth');
const { parseAvatar, parseGameCover } = require('../../src/parsers');
const { getPopularGames, getNewestGames, getQueryGames } = require('../../src/discovery');

let isDev = process.env.NODE_ENV !== 'prod';

router.route('/popular/:page?')
    .get(auth.optionalToken, getPopularHandler);

router.route('/newest/:page?')
    .get(auth.optionalToken, getNewestHandler);

router.route('/find')
    .post(auth.optionalToken, postFindHandler);

/**
 * @api {get} /discovery/popular Get the 16 most popular games
 * @apiName GetPopularGames
 * @apiGroup Discovery
 * @apiPermission Public
 * 
 * @apiHeader {String} x-access-token (Optional) JWT Token for authentication
 * @apiParam {Integer} page (Optional) Page (wraps every 16 games)
 * 
 * @apiSuccess (200) {Array} games Array of Games
 */
async function getPopularHandler(req, res) {
    if(isDev) console.log(chalk.grey("[mgg-server] (Discovery) Popular->Get"));

    if(req.params.page == undefined) {
        req.params.page = 0;
    }

    let gamesData = await getPopularGames(req.params.page);

    // Dirty hack to make the data editable
    gamesData = JSON.parse(JSON.stringify(gamesData));

    let filteredGames = [];
    gamesData.forEach((game) => {
        game.coverFileName = parseGameCover(game.coverFileName);


        // remove security related fields for return
        game.user.password = undefined;
        game.user.email = undefined;
        game.user.loginDiscord = undefined;
        game.user.loginTwitter = undefined;
        game.user.loginYouTube = undefined;

        game.user.avatarFileName = parseAvatar(game.user.avatarFileName);

        filteredGames.push(game);
    });
    
    gamesData = filteredGames;

    res.status(200).json(gamesData);
}

/**
 * @api {get} /discovery/newest Get the 16 newest games
 * @apiName GetNewestGames
 * @apiGroup Discovery
 * @apiPermission Public
 * 
 * @apiHeader {String} x-access-token (Optional) JWT Token for authentication
 * @apiParam {Integer} page (Optional) Page (wraps every 16 games)
 * 
 * @apiSuccess (200) {Array} games Array of Games
 */
 async function getNewestHandler(req, res) {
    if(isDev) console.log(chalk.grey("[mgg-server] (Discovery) Newest->Get"));

    if(req.params.page == undefined) {
        req.params.page = 0;
    }

    let gamesData = await getNewestGames(req.params.page);

    // Dirty hack to make the data editable
    gamesData = JSON.parse(JSON.stringify(gamesData));

    let filteredGames = [];
    gamesData.forEach((game) => {
        game.coverFileName = parseGameCover(game.coverFileName);

        // remove security related fields for return
        game.user.password = undefined;
        game.user.email = undefined;
        game.user.loginDiscord = undefined;
        game.user.loginTwitter = undefined;
        game.user.loginYouTube = undefined;

        game.user.avatarFileName = parseAvatar(game.user.avatarFileName);

        filteredGames.push(game);
    });
    
    gamesData = filteredGames;

    res.status(200).json(gamesData);
}

/**
 * @api {post} /discovery/find Find games based on a condition
 * @apiName FindGames
 * @apiGroup Discovery
 * @apiPermission Public
 * 
 * @apiHeader {String} x-access-token (Optional) JWT Token for authentication
 * @apiParam {String} query Search Query
 * 
 * @apiSuccess (200) {Array} games Array of Games
 */
 async function postFindHandler(req, res) {
    if(isDev) console.log(chalk.grey("[mgg-server] (Discovery) Find->Post"));

    if(req.body.query === '') {
        res.status(400).json({name: "MISSING_FIELDS", text: "Required fields: query"});
        return;
    }

    let gamesData = await getQueryGames(req.body.query, req.userId, req.userRoles);

    // Dirty hack to make the data editable
    gamesData = JSON.parse(JSON.stringify(gamesData));

    let filteredGames = [];
    gamesData.forEach((game) => {
        game.coverFileName = parseGameCover(game.coverFileName);

        // remove security related fields for return
        game.user.password = undefined;
        game.user.email = undefined;
        game.user.loginDiscord = undefined;
        game.user.loginTwitter = undefined;
        game.user.loginYouTube = undefined;

        game.user.avatarFileName = parseAvatar(game.user.avatarFileName);

        filteredGames.push(game);
    });
    
    gamesData = filteredGames;

    res.status(200).json(gamesData);
}

module.exports = router;