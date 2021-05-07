require('dotenv').config();
const chalk = require('chalk');

console.log(chalk.cyan("[mgg-server] Populate database with test data"));

const { User, Game } = require('../sequelize');

// TODO: Create Users and Games