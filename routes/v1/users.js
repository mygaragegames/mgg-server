const express = require('express');
const router = express.Router();
const chalk = require('chalk');

const { User } = require('../../sequelize');
const { getAllUsers, getOneUser, createUser } = require('../../src/users');

router.route('/')
    .get(getAllHandler)
    .post(postOneHandler);

router.route('/:userid')
    .get(getOneHandler)
    .put(putOneHandler)
    .delete(deleteOneHandler);

async function getAllHandler(req, res) {
    console.log(chalk.grey("[mgg-server] Users->Get"));

    let users = await getAllUsers();
    res.status(200).json(users);
}
async function getOneHandler(req, res) {
    console.log(chalk.grey("[mgg-server] Users->GetOne"));

    if(req.params.userid == undefined) {
        res.status(400).json({name: "MISSING_DATA", text: "Required parameter: userid"});
        return;
    }

    let userData = await getOneUser({ id: req.params.userid });
    res.status(200).json(userData);
}
async function postOneHandler(req, res) {
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
        res.status(400).json({name: "MISSING_DATA", text: "Required fields: username, password, email"});
        return;
    }

    let createUserResponse = await createUser( data );

    switch(createUserResponse) {
        case 409:
            res.status(409).json({name: "USERNAME_EMAIL_CONFLICT", text: "Username or email is already in use!"});
            break;
        case 500:
            res.status(500).json({name: "UNKNOWN_SERVER_ERROR", text: "Unknown Server Error! Please try again later!"});
            break;
        default:
            res.status(201).json({name: "USER_CREATED", text: "User was created"});
            break;
    }
}
function putOneHandler(req, res) {
    console.log(chalk.grey("[mgg-server] Users->Put"));

    // TODO: Check for Authorization

    // TODO: Update User
}
function deleteOneHandler(req, res) {
    console.log(chalk.grey("[mgg-server] Users->Delete"));

    // TODO: Check for Authorization

    // TODO: Remove User
}

module.exports = router;