require('dotenv').config();
const chalk = require('chalk');

console.log(chalk.cyan("[mgg-server] Populate database with test data"));

const { User, Game } = require('../sequelize');

const { createUser } = require('../src/users');

// Create Dummy Users
for(var i = 0; i < 10; i++) {
    let currentI = i;

    createUser({
        "username": "taw" + currentI,
        "password": "taw1337" + currentI,
        "email": "taw" + currentI + "@mygarage.games"
    }).then((responseCode) => {
        if(responseCode == 201) {
            console.log(chalk.green("[mgg-server] Created user 'taw" + currentI + "'"));
        } else {
            console.log(chalk.red("[mgg-server] 'taw" + currentI + "' could not be created! Error: " + responseCode));
        }
    });
}

// Create Dummy Games

// TODO