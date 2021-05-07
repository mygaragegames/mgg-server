const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const chalk = require('chalk');

const { User } = require('../../sequelize');

router.route('/')
    .get(getHandler)
    .post(postHandler)
    .put(putHandler)
    .delete(deleteHandler);

function getHandler(req, res) {
    console.log(chalk.grey("[mgg-server] Users->Get"));

    User.findAll().then((users) => {
        let output = [];

        users.forEach((user) => {
            let publicUser = user;

            // remove security related fields
            publicUser.password = undefined;
            publicUser.email = undefined;

            output.push(publicUser);
        });

        res.json(output);
    });
}
function postHandler(req, res) {
    console.log(chalk.grey("[mgg-server] Users->Post"));
    
    const data = {
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        pronouns: req.body.pronouns,
        gameID: req.body.gameID,
        socialDiscord: req.body.socialDiscord,
        socialTwitter: req.body.socialTwitter,
        socialYouTube: req.body.socialYouTube
    };

    if(data.username === '' || data.password === '' || data.email === '') {
        res.status(400).json({name: "MISSING_FIELDS", text: "Required fields: username, password, email"});
        return;
    }

    bcrypt.hash(data.password, 12)
        .then(function(passwordHash) {
            data.password = passwordHash;

            User.create(data).then(() => {
                res.status(201).json({name: "USER_CREATED", text: "User was created"});
            }).catch(function(error) {
                if(error.name === 'SequelizeUniqueConstraintError') {
                    console.log("ERRRORRR");
                    res.status(409).json({name: "USERNAME_EMAIL_CONFLICT", text: "Username or email is already in use!"});
                } else {
                    console.log(error);
                    res.status(500).json({name: "UNKNOWN_SERVER_ERROR", text: "Unknown Server Error! Please try again later!"});
                }
            });
        });
}
function putHandler(req, res) {
    console.log(chalk.grey("[mgg-server] Users->Put"));

    // TODO: Check for Authorization

    // TODO: Update User
}
function deleteHandler(req, res) {
    console.log(chalk.grey("[mgg-server] Users->Delete"));

    // TODO: Check for Authorization

    // TODO: Remove User
}

module.exports = router;