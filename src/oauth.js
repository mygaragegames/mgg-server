const chalk = require('chalk');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const uniqid = require('uniqid');
const OAuthClient = require('client-oauth2');
const { makeUsernameValid } = require('./parsers');
const { loginViaMethod } = require('./auth');
const { createUser, setAvatar } = require('./users');
const { response } = require('express');

let discordAuthClient = new OAuthClient({
    clientId: process.env.OAUTH_DISCORD_CLIENTID,
    clientSecret: process.env.OAUTH_DISCORD_CLIENTSECRET,
    accessTokenUri: 'https://discord.com/api/oauth2/token',
    authorizationUri: 'https://discord.com/api/oauth2/authorize',
    redirectUri: process.env.OAUTH_DISCORD_REDIRECTURI,
    scopes: ['identify', 'email']
});

function getDiscordUri() {
    return discordAuthClient.code.getUri();
}

async function processDiscordCallback( callbackCode ) {
    return new Promise(async (resolve, reject) => {
        // Get OAuthToken
        discordAuthClient.code.getToken( callbackCode ).then(async (user) => {
            // Get UserData
            let userResponse = await axios.get('https://discord.com/api/users/@me', {
                headers: {
                    'Authorization': `Bearer ${user.accessToken}`
                } 
            });
            
            // Find user connected to ID
            loginViaMethod("discord", userResponse.data.id).then((userData) => {
                resolve(userData);
            }).catch((error) => {
                if(error == 404) {
                    let newUser = {
                        username: makeUsernameValid(userResponse.data.username + "-" + userResponse.data.discriminator),
                        email: userResponse.data.email,
                        loginDiscord: userResponse.data.id
                    }

                    createUser(newUser).then(async (userData) => {
                        let avatarTempPath = path.resolve(__dirname, '../tmp', uniqid() + ".png");
                        let userAvatarUrl = `https://cdn.discordapp.com/avatars/${userResponse.data.id}/${userResponse.data.avatar}.png?size=256`;
                        let avatarDownload = await axios({
                            url: userAvatarUrl,
                            method: 'GET',
                            responseType: 'stream'
                        });

                        let avatarWriter = avatarDownload.data.pipe(fs.createWriteStream(avatarTempPath));
                        avatarWriter.on('finish', () => {
                            // Set Avatar
                            setAvatar(userData, { path: avatarTempPath }).then((avatarUrl) => {
                                loginViaMethod("discord", userResponse.data.id).then((userData) => {
                                    resolve(userData);
                                    return;
                                }).catch((error) => {
                                    reject(error);
                                    return;
                                });
                            }).catch((error) => {
                                // Remove avatar if not downloaded & set successfully
                                try {
                                    fs.unlinkSync(avatarTempPath);
                                } catch(error) {}

                                loginViaMethod("discord", userResponse.data.id).then((userData) => {
                                    resolve(userData);
                                    return;
                                }).catch((error) => {
                                    reject(error);
                                    return;
                                });
                            });
                        });
                        avatarWriter.on('error', (error) => {
                            try {
                                fs.unlinkSync(avatarTempPath);
                            } catch(error) {}
                            
                            loginViaMethod("discord", userResponse.data.id).then((userData) => {
                                resolve(userData);
                                return;
                            }).catch((error) => {
                                reject(error);
                                return;
                            });
                        })
                    }).catch((error) => {
                        reject(error);
                        return;
                    });
                } else {
                    reject(error);
                }
            });
        }).catch(error => {
            console.error(error);
            reject(error);
        });
    });
}

module.exports = {
    getDiscordUri,
    processDiscordCallback
}