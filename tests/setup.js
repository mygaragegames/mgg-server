require('dotenv').config();
const chalk = require('chalk');

console.log(chalk.cyan("[mgg-server] Populate database with test data"));

const { User, Game } = require('../sequelize');

const { createUser } = require('../src/users');

// Create Dummy Users
for(var i = 0; i < 10; i++) {
    createUser({
        "username": "taw" + i,
        "password": "taw1337" + i,
        "email": "taw" + i + "@mygarage.games"
    }).then((userData) => {
        console.log(chalk.green("[mgg-server] Created user '" + userData.username + "'"));
    }).catch((error) => {
        console.log(chalk.red("[mgg-server] Error during user creation: " + error));
    });
}

// Create Dummy Games

// TODO