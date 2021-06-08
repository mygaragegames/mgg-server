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
            loginViaMethod({ method: "discord", id: userResponse.data.id }).then((userData) => {
                resolve(userData);
            }).catch((error) => {
                console.log(error);

                if(error == 404) {
                    let newUser = {
                        username: makeUsernameValid(userResponse.data.username),
                        email: userResponse.data.email,
                        loginDiscord: userResponse.data.id
                    }

                    createUser(newUser).then(async (userData) => {
                        console.log(userData);

                        let avatarTempPath = path.resolve(__dirname, '../tmp', uniqid() + ".png");
                        let userAvatarUrl = `https://cdn.discordapp.com/avatars/${userResponse.data.id}/${userResponse.data.avatar}.png?size=256`;
                        let avatarDownload = await axios({
                            url: userAvatarUrl,
                            method: 'GET',
                            responseType: 'stream'
                        });

                        console.log(`Downloading in: ${avatarTempPath}`);

                        let avatarWriter = avatarDownload.data.pipe(fs.createWriteStream(avatarTempPath));
                        avatarWriter.on('finish', () => {
                            console.log("Writing avatar done");

                            // Set Avatar
                            setAvatar(userData, { path: avatarTempPath }).then((avatarUrl) => {
                                loginViaMethod({ method: "discord", id: userResponse.data.id}).then((userData) => {
                                    resolve(userData);
                                    return;
                                }).catch((error) => {
                                    reject(error);
                                    return;
                                });
                            }).catch((error) => {
                                try {
                                    fs.unlinkSync(avatarTempPath);
                                } catch(error) {}

                                loginViaMethod({ method: "discord", id: userResponse.data.id}).then((userData) => {
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
                            
                            loginViaMethod({ method: "discord", id: userResponse.data.id}).then((userData) => {
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