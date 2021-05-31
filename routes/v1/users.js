const express = require('express');
const multer = require('multer');
const router = express.Router();
const chalk = require('chalk');
const path = require('path');
const auth = require('../../middlewares/auth');
const { parseAvatar, parseGameCover, isUsernameValid, isCreatorIDValid } = require('../../src/parsers');
const { User } = require('../../sequelize');
const { getAllUsers, getOneUser, createUser, updateUser, setAvatar, deleteAvatar } = require('../../src/users');

let upload = multer({ dest: '/tmp/'});

router.route('/')
    .get(getAllHandler)
    .post(postOneHandler);

router.route('/:userid')
    .get(auth.optionalToken, getOneHandler)
    .put(auth.verifyToken, putOneHandler);

router.route('/:userid/avatar')
    .put(auth.verifyToken, upload.single('avatar'), putUpdateAvatarHandler)
    .delete(auth.verifyToken, deleteUpdateAvatarHandler)

async function getAllHandler(req, res) {
    console.log(chalk.grey("[mgg-server] (Users) Users->Get"));

    let users = await getAllUsers();

    users.forEach(user => {
        // remove security related fields for return
        user.password = undefined;
        user.email = undefined;
        user.avatarFileName = parseAvatar(user.avatarFileName);
    });
    
    res.status(200).json(users);
}
async function getOneHandler(req, res) {
    console.log(chalk.grey("[mgg-server] (Users) Users->GetOne"));

    if(req.params.userid === undefined) {
        res.status(400).json({name: "MISSING_FIELDS", text: "Required fields: userid"});
        return;
    }

    let searchOptions = undefined;
    if(parseInt(req.params.userid)) {
        searchOptions = { id: req.params.userid };
    } else if(isCreatorIDValid(req.params.userid)) {
        searchOptions = { ingameID: req.params.userid };
    } else if(isUsernameValid(req.params.userid)) {
        searchOptions = { username: req.params.userid };
    }

    let userData = await getOneUser(searchOptions).catch((error) => { return null; });
    if(userData === null) {
        res.status(404).json({name: "USER_NOT_FOUND", text: `There is no user with the id ${req.params.userid}`});
        return;
    }

    // Dirty hack to make the data editable
    userData = JSON.parse(JSON.stringify(userData));

    // remove security related fields for return
    userData.password = undefined;
    userData.email = undefined;
    userData.avatarFileName = parseAvatar(userData.avatarFileName);

    let filteredGames = [];
    userData.games.forEach((game) => {
        // Only add display status 1 & 2 games when owner or admin/moderator
        if(game.displayStatus == 1 || game.displayStatus == 2) {
            if(req.userId == null) return;
            if(req.userRoles == null) return;
            if(game.userId !== req.userId && !req.userRoles.includes('moderator', 'admin')) return;
        }

        game.coverFileName = parseGameCover(game.coverFileName);
        game.user.password = undefined;
        game.user.email = undefined;
        game.user.avatarFileName = parseAvatar(game.user.avatarFileName);

        filteredGames.push(game);
    });

    userData.games = filteredGames;

    res.status(200).json(userData);
}
async function postOneHandler(req, res) {
    console.log(chalk.grey("[mgg-server] (Users) Users->Post"));
    
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

    createUser( data ).then((userData) => {
        // remove security related fields for return
        userData.password = undefined;
        userData.email = undefined;
        userData.avatarFileName = parseAvatar(userData.avatarFileName);

        res.status(201).json(userData);
    }).catch((error) => {
        switch(error) {
            case 500:
            default:
                res.status(500).json({name: "UNKNOWN_SERVER_ERROR", text: "Unknown Server Error! Please try again later!"});
                return;
            case 409:
                res.status(409).json({name: "USERNAME_EMAIL_CONFLICT", text: "Username or email is already in use!"});
                return;
            case 418:
                res.status(418).json({name: "USERNAME_INVALID", text: "Username is not valid!"});
                return;
            case 406:
                res.status(406).json({name: "EMAIL_INVALID", text: "Email is not valid!"});
                return;
            case 400:
                res.status(400).json({name: "USER_INGAMEID_WRONGFORMAT", text: "The ingame ID has the wrong format (P-000-000-000)."});
                return;
        }
    });
}
async function putOneHandler(req, res) {
    console.log(chalk.grey("[mgg-server] (Users) Users->Put"));

    const data = {
        pronouns: req.body.pronouns,
        ingameID: req.body.ingameID,
        socialDiscord: req.body.socialDiscord,
        socialTwitter: req.body.socialTwitter,
        socialYouTube: req.body.socialYouTube,
    };

    let user = await getOneUser({ id: parseInt(req.params.userid) }).catch(() => { return null; });
    if(user === null) {
        res.status(404).json({name: "USER_NOT_FOUND", text: `There is no user with the id ${req.params.userid}`});
        return;
    }

    // Check if user is owner or moderator/admin
    if(user.id !== req.userId && !req.userRoles.includes('moderator', 'admin')) {
        res.status(403).json({name: "AUTHENTICATION_NEEDED", text: "You are not allowed to perform this action."});
        return;
    }

    updateUser( user, data ).then((data) => {
        res.status(201).json({name: "USER_UPDATED", text: "User was updated."});
        return;
    }).catch((error) => {
        switch(error) {
            default:
                res.status(500).json({name: "UNKNOWN_ERROR", text: "User could not be updated."});
                return;
            case 400:
                res.status(400).json({name: "USER_INGAMEID_WRONGFORMAT", text: "The ingame ID has the wrong format (P-000-000-000)."});
                return;
        }
    });
}
async function putUpdateAvatarHandler(req, res) {
    console.log(chalk.grey("[mgg-server] (Users) Users->PutUpdateAvatar"));

    if(req.params.userid === '' || req.file === undefined) {
        res.status(400).json({name: "MISSING_FIELDS", text: "Required fields: userId, avatar"});
        return;
    }

    // Find attached user
    let user = await getOneUser({ id: req.params.userid }).catch(() => { return null; });
    if(user === null) {
        res.status(404).json({name: "USER_NOT_FOUND", text: `There is no user with the id ${req.params.userid}`});
        return;
    }

    // Check if user is owner or moderator/admin
    if(user.id !== req.userId && !req.userRoles.includes('moderator', 'admin')) {
        res.status(403).json({name: "AUTHENTICATION_NEEDED", text: "You are not allowed to perform this action."});
        return;
    }
    
    setAvatar(user, req.file).then(() => {
        res.status(201).json({name: "USER_AVATAR_UPDATED", text: "Avatar was updated."});
        return;
    }).catch((error) => {
        if(error === 404) {
            res.status(404).json({name: "USER_NOT_FOUND", text: `There is no user with the id ${req.params.userid}`});
        } else {
            switch(error) {
                default:
                    res.status(500).json({name: "UNKNOWN_ERROR", text: "Avatar could not be updated."});
                    return;
                case 400:
                    res.status(400).json({name: "USER_AVATAR_WRONGFORMAT", text: "Your avatar is not a png or jpg file."});
                    return;
            }
        }
    });
}
async function deleteUpdateAvatarHandler(req, res) {
    console.log(chalk.grey("[mgg-server] (Users) Users->DeleteUpdateAvatar"));

    if(req.params.userid === '') {
        res.status(400).json({name: "MISSING_FIELDS", text: "Required fields: userId"});
        return;
    }

    // Find attached user
    let user = await getOneUser({ id: req.params.userid }).catch(() => { return null; });
    if(user === null) {
        res.status(404).json({name: "USER_NOT_FOUND", text: `There is no user with the id ${req.params.userid}`});
        return;
    }

    // Check if user is owner or moderator/admin
    if(user.id !== req.userId && !req.userRoles.includes('moderator', 'admin')) {
        res.status(403).json({name: "AUTHENTICATION_NEEDED", text: "You are not allowed to perform this action."});
        return;
    }

    deleteAvatar( user ).then(() => {
        res.status(200).json({name: "USER_AVATAR_DELETED", text: "Avatar was deleted."});
        return;
    }).catch((error) => {
        if(error === 404) {
            res.status(404).json({name: "USER_NOT_FOUND", text: `There is no user with the id ${req.params.userid}`});
        } else {
            res.status(500).json({name: "UNKNOWN_SERVER_ERROR", text: "Unknown Server Error! Please try again later!"});
        }
    });
}

module.exports = router;