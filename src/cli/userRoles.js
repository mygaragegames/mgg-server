require('dotenv').config();

const chalk = require('chalk');
const { User, UserRole } = require('../../sequelize');

console.clear();
console.log("---> mygarage.games [mgg-server] <---");

let isDev = process.env.NODE_ENV !== 'prod';
let arguments = process.argv.slice(2);

switch(arguments[0]) {
    default:
    case "help":
        console.log(chalk.cyan("Usage: yarn cli:userRoles [command] [userID] [role]"));
        console.log("");
        console.log(chalk.white("Commands: ") + chalk.grey("help, promote, demote"));
        console.log(chalk.white("Roles: ") + chalk.grey("user, moderator, admin"));

        process.exit();
        break;
    case "promote":
        console.log(chalk.cyan("Promoting User"));

        promoteUser(arguments[1], arguments[2]);
        break;
    case "demote":
        console.log(chalk.cyan("Demoting User"));

        demoteUser(arguments[1], arguments[2]);
        break;
}

async function promoteUser(userID, roleName) {
    let user = await User.findOne({ where: { id: userID }});
    let role = await UserRole.findOne({ where: { name: roleName}});

    console.log("Giving role " + chalk.green(role.name) + " to user " + chalk.green(user.username));

    user.addRole(role).then(result => {
        process.exit();
    }).catch(error => {
        console.error(error);
        process.exit(error.code);
    });
}

async function demoteUser(userID, roleName) {
    let user = await User.findOne({ where: { id: userID }});
    let role = await UserRole.findOne({ where: { name: roleName}});

    console.log("Deleting role " + chalk.green(role.name) + " from user " + chalk.green(user.username));

    user.removeRole(role).then(result => {
        process.exit();
    }).catch(error => {
        console.error(error);
        process.exit(error.code);
    });
}