const express = require('express');
const multer = require('multer');
const router = express.Router();
const chalk = require('chalk');

const { User } = require('../../sequelize');
const { getAllUsers, getOneUser, createUser, setAvatar, removeAvatar } = require('../../src/users');

let upload = multer({ dest: '/tmp/'});

router.route('/')
    .get(getAllHandler)
    .post(postOneHandler);

router.route('/:userid')
    .get(getOneHandler)
    .put(putOneHandler)
    .delete(deleteOneHandler);

router.route('/:userid/updateAvatar')
    .put(upload.single('avatar'), putUpdateAvatarHandler)
    .delete(deleteUpdateAvatarHandler)

async function getAllHandler(req, res) {
    console.log(chalk.grey("[mgg-server] Users->Get"));

    let users = await getAllUsers();
    res.status(200).json(users);
}
async function getOneHandler(req, res) {
    console.log(chalk.grey("[mgg-server] Users->GetOne"));

    if(req.params.userid === undefined) {
        res.status(400).json({name: "MISSING_FIELDS", text: "Required fields: userid"});
        return;
    }

    let userData = await getOneUser({ id: req.params.userid }).catch((error) => { return (error === 404) ? 404 : 500; });

    if(userData === 500) {
        res.status(500).json({name: "UNKNOWN_SERVER_ERROR", text: "Unknown Server Error! Please try again later!"});
    } else if(userData === 404) {
        res.status(404).json({name: "USER_NOT_FOUND", text: "There is no user with the id " + req.params.userid});
    } else {
        res.status(200).json(userData);
    }
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
        res.status(400).json({name: "MISSING_FIELDS", text: "Required fields: username, password, email"});
        return;
    }

    createUser( data ).then((user) => {
        res.status(201).json(user);
    }).catch((error) => {
        console.error(error);

        if(error == 409) {
            res.status(409).json({name: "USERNAME_EMAIL_CONFLICT", text: "Username or email is already in use!"});
        } else {
            res.status(500).json({name: "UNKNOWN_SERVER_ERROR", text: "Unknown Server Error! Please try again later!"});
        }
    });
}
async function putOneHandler(req, res) {
    console.log(chalk.grey("[mgg-server] Users->Put"));

    // TODO: Check for Authorization

    // TODO: Update User
}
async function deleteOneHandler(req, res) {
    console.log(chalk.grey("[mgg-server] Users->Delete"));

    // TODO: Check for Authorization

    // TODO: Remove User
}
async function putUpdateAvatarHandler(req, res) {
    console.log(chalk.grey("[mgg-server] Users->PutUpdateAvatar"));

    if(req.params.userid === '' || req.file === undefined) {
        res.status(400).json({name: "MISSING_FIELDS", text: "Required fields: userId, avatar"});
        return;
    }

    // Find attached user
    let user = await getOneUser({ id: req.params.userid }).catch(() => { return null; });
    if(user === null) {
        res.status(404).json({name: "USER_NOT_FOUND", text: "There is no user with the id " + req.params.userid});
        return;
    }

    // TODO: Check for Authorization
    
    setAvatar(user, req.file).then(() => {
        res.status(201).json({name: "USER_AVATAR_UPDATED", text: "Avatar was updated."});
        return;
    }).catch((error) => {
        if(error === 404) {
            res.status(404).json({name: "USER_NOT_FOUND", text: "There is no user with the id " + req.params.userid});
        } else {
            res.status(500).json({name: "UNKNOWN_SERVER_ERROR", text: "Unknown Server Error! Please try again later!"});
        }
    });
}
async function deleteUpdateAvatarHandler(req, res) {
    console.log(chalk.grey("[mgg-server] Users->DeleteUpdateAvatar"));

    if(req.params.userid === '') {
        res.status(400).json({name: "MISSING_FIELDS", text: "Required fields: userId"});
        return;
    }

    // Find attached user
    let user = await getOneUser({ id: req.params.userid }).catch(() => { return null; });
    if(user === null) {
        res.status(404).json({name: "USER_NOT_FOUND", text: "There is no user with the id " + req.params.userid});
        return;
    }

    // TODO: Check for Authorization

    removeAvatar( user ).then(() => {
        res.status(200).json({name: "USER_AVATAR_UPDATED", text: "Avatar was removed."});
        return;
    }).catch((error) => {
        if(error === 404) {
            res.status(404).json({name: "USER_NOT_FOUND", text: "There is no user with the id " + req.params.userid});
        } else {
            res.status(500).json({name: "UNKNOWN_SERVER_ERROR", text: "Unknown Server Error! Please try again later!"});
        }
    });
}

module.exports = router;