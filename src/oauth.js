const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const chalk = require('chalk');
const axios = require('axios');
const OAuthClient = require('client-oauth2');
const { makeUsernameValid } = require('./parsers');

let isDev = process.env.NODE_ENV !== 'prod';

let redirectUri = "";
if(isDev) {
    redirectUri = `http://localhost:${process.env.PORT_HTTP}/v1/oauth/discord/callback`;
} else {
    redirectUri = `https://api.mygarage.games/v1/oauth/discord/callback`;
}

let discordAuthClient = new OAuthClient({
    clientId: process.env.OAUTH_DISCORD_CLIENTID,
    clientSecret: process.env.OAUTH_DISCORD_CLIENTSECRET,
    accessTokenUri: 'https://discord.com/api/oauth2/token',
    authorizationUri: 'https://discord.com/api/oauth2/authorize',
    redirectUri: redirectUri,
    scopes: ['identify', 'email']
});

function getDiscordUri() {
    return discordAuthClient.code.getUri();
}

async function processDiscordCallback( callbackUrl ) {
    return new Promise(async (resolve, reject) => {
        // Get OAuthToken
        discordAuthClient.code.getToken( callbackUrl ).then(async (user) => {
            // Get UserData
            let userResponse = await axios.get('https://discord.com/api/users/@me', {
                headers: {
                    'Authorization': `Bearer ${user.accessToken}`
                } 
            });
            
            // Find user connected to ID
            // Authenticate with JWT

            // Create new user if not found
            let newUser = {
                username: makeUsernameValid(userResponse.data.username),
                email: userResponse.data.email,
                loginDiscord: userResponse.data.id
            }

            let userAvatarUrl = `https://cdn.discordapp.com/avatars/${userResponse.data.id}/${userResponse.data.avatar}.png?size=256`;

            resolve(newUser);
        }).catch(error => {
            console.error(error);
            reject();
        });
    });
}

module.exports = {
    getDiscordUri,
    processDiscordCallback
}