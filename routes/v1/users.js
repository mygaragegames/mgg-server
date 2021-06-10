const express = require('express');
const multer = require('multer');
const router = express.Router();
const chalk = require('chalk');
const path = require('path');
const auth = require('../../middlewares/auth');
const { parseAvatar, parseGameCover, isUsernameValid, isCreatorIDValid } = require('../../src/parsers');
const { User } = require('../../sequelize');
const { getAllUsers, getOneUser, createUser, updateUser, setAvatar, deleteAvatar } = require('../../src/users');

let isDev = process.env.NODE_ENV !== 'prod';

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

/**
 * @api {get} /users Get all users
 * @apiName GetAllUsers
 * @apiGroup Users
 * 
 * @apiSuccess (200) {Array} users Array of users
 */
async function getAllHandler(req, res) {
    if(isDev) console.log(chalk.grey("[mgg-server] (Users) Users->Get"));

    let users = await getAllUsers();

    users.forEach(user => {
        // remove security related fields for return
        user.password = undefined;
        user.email = undefined;
        user.avatarFileName = parseAvatar(user.avatarFileName);
    });
    
    res.status(200).json(users);
}

/**
 * @api {get} /users/:userId Get detailled information from a user
 * @apiName GetOneUsers
 * @apiGroup Users
 * 
 * @apiHeader {String} x-access-token (Optional) JWT Token for authentication
 * @apiParam {Integer} userId The ID of the User
 * 
 * @apiSuccess (200) {Integer} id ID of the User
 * @apiSuccess (200) {String} username Username
 * @apiSuccess (200) {String} avatarFileName URL to the Users avatar
 * @apiSuccess (200) {String} pronouns Chosen pronouns
 * @apiSuccess (200) {String} ingameID Ingame-ID
 * @apiSuccess (200) {String} socialDiscord Discord username of the User
 * @apiSuccess (200) {String} socialTwitter Twitter username of the User
 * @apiSuccess (200) {String} socialYouTube YouTube username of the User
 * @apiSuccess (200) {DateTime} createdAt Join date of the User
 * @apiSuccess (200) {DateTime} updatedDate Last time the User updated their profile
 * @apiSuccess (200) {Array} playlists Playlists created by the User (currently called "Play Later")
 * @apiSuccess (200) {Array} comments Comments posted by the User
 * @apiSuccess (200) {Array} games Games published by the User
 * @apiError (404) USER_NOT_FOUND There is no user with the id <code>:userId</code>
 */
async function getOneHandler(req, res) {
    if(isDev) console.log(chalk.grey("[mgg-server] (Users) Users->GetOne"));

    if(req.params.userid === undefined) {
        res.status(400).json({name: "MISSING_FIELDS", text: "Required fields: userid"});
        return;
    }

    let numberRegex = /^\d+$/;
    let searchOptions = undefined;
    if(numberRegex.test(req.params.userid)) {
        searchOptions = { id: req.params.userid };
    } else if(isCreatorIDValid(req.params.userid)) {
        searchOptions = { ingameID: req.params.userid };
    } else if(isUsernameValid(req.params.userid)) {
        searchOptions = { username: req.params.userid };
    }

    let userData = await getOneUser(searchOptions, req.userId, req.userRoles).catch((error) => { return null; });
    if(userData === null) {
        res.status(404).json({name: "USER_NOT_FOUND", text: `There is no user with the id ${req.params.userid}`});
        return;
    }

    let userRoles = [];
    await userData.getRoles().then((roles) => {
        roles.forEach(role => {
            userRoles.push(role.name);
        });
    });

    // Dirty hack to make the data editable
    userData = JSON.parse(JSON.stringify(userData));

    userData.roles = userRoles;

    // remove security related fields for return
    userData.password = undefined;
    userData.email = undefined;
    userData.avatarFileName = parseAvatar(userData.avatarFileName);

    let filteredGames = [];
    userData.games.forEach((game) => {
        game.coverFileName = parseGameCover(game.coverFileName);
        game.user.password = undefined;
        game.user.email = undefined;
        game.user.avatarFileName = parseAvatar(game.user.avatarFileName);

        filteredGames.push(game);
    });

    userData.games = filteredGames;

    res.status(200).json(userData);
}

/**
 * @api {post} /users Creates a User
 * @apiName CreateUser
 * @apiGroup Users
 * 
 * @apiParam {String} username Username for the User
 * @apiParam {String} password Password for the User
 * @apiParam {String} email Email for the User
 * @apiParam {String} pronouns (Optional) Pronouns for the User
 * @apiParam {String} gameID (Optional) Ingame-ID for the User
 * @apiParam {String} socialDiscord (Optional) Discord username for the User
 * @apiParam {String} socialTwitter (Optional) Twitter username for the User
 * @apiParam {String} socialYouTube (Optional) YouTube username for the User
 * 
 * @apiSuccess (201) {Object} User object of created user
 * @apiError (409) USERNAME_EMAIL_CONFLICT Username or email is already in use.
 * @apiError (406) USERNAME_INVALID Username is not valid!
 * @apiError (406) EMAIL_INVALID Email is not valid!
 * @apiError (406) USER_INGAMEID_WRONGFORMAT The ingame ID has the wrong format (P-000-000-000).
 */
async function postOneHandler(req, res) {
    if(isDev) console.log(chalk.grey("[mgg-server] (Users) Users->Post"));
    
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
                res.status(406).json({name: "USERNAME_INVALID", text: "Username is not valid!"});
                return;
            case 406:
                res.status(406).json({name: "EMAIL_INVALID", text: "Email is not valid!"});
                return;
            case 400:
                res.status(406).json({name: "USER_INGAMEID_WRONGFORMAT", text: "The ingame ID has the wrong format (P-000-000-000)."});
                return;
        }
    });
}

/**
 * @api {put} /users/:userId Updates a User
 * @apiName UpdateUser
 * @apiGroup Users
 * 
 * @apiHeader {String} x-access-token JWT Token for authentication
 * @apiParam {Integer} userId The ID of the User
 * 
 * @apiParam {String} username (Optional) Username for the User
 * @apiParam {String} pronouns (Optional) Pronouns for the User
 * @apiParam {String} gameID (Optional) Ingame-ID for the User
 * @apiParam {String} socialDiscord (Optional) Discord username for the User
 * @apiParam {String} socialTwitter (Optional) Twitter username for the User
 * @apiParam {String} socialYouTube (Optional) YouTube username for the User
 * 
 * @apiSuccess (201) USER_UPDATED User was updated.
 * @apiError (404) USER_NOT_FOUND There is no user with the id <code>userId</code>
 * @apiError (406) USER_INGAMEID_WRONGFORMAT The ingame ID has the wrong format (P-000-000-000).
 * @apiError (409) USERNAME_EMAIL_CONFLICT Username is already in use.
 * @apiError (406) USERNAME_INVALID Username is not valid!
 * @apiError (403) AUTHENTICATION_BANNED Your account was banned. (Reason included in body)
 * @apiError (403) AUTHENTICATION_WRONG You are not allowed to perform this action.
 * @apiError (403) AUTHENTICATION_NEEDED You are not allowed to perform this action.
 */
async function putOneHandler(req, res) {
    if(isDev) console.log(chalk.grey("[mgg-server] (Users) Users->Put"));

    const data = {
        username: req.body.username,
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
    if(user.id !== req.userId && !['moderator', 'admin'].some(str => req.userRoles.includes(str))) {
        res.status(403).json({name: "AUTHENTICATION_NEEDED", text: "You are not allowed to perform this action."});
        return;
    }

    updateUser( user, data ).then((data) => {
        res.status(201).json({name: "USER_UPDATED", text: "User was updated."});
        return;
    }).catch((error) => {
        switch(error) {
            default:
                console.log(error);
                res.status(500).json({name: "UNKNOWN_ERROR", text: "User could not be updated."});
                return;
            case 409:
                res.status(409).json({name: "USERNAME_EMAIL_CONFLICT", text: "Username is already in use!"});
                return;
            case 406:
                res.status(406).json({name: "USER_INGAMEID_WRONGFORMAT", text: "The ingame ID has the wrong format (P-000-000-000)."});
                return;
            case 418:
                res.status(406).json({name: "USERNAME_INVALID", text: "Username is not valid!"});
                return;
        }
    });
}

/**
 * @api {put} /users/:userId/avatar Updates a Users avatar
 * @apiName UpdateUserAvatar
 * @apiGroup Users
 * 
 * @apiHeader {String} x-access-token JWT Token for authentication
 * @apiParam {Integer} userId The ID of the User
 * 
 * @apiParam {File} avatar multipart/form-data of a png or jpg file
 * 
 * @apiSuccess (201) USER_AVATAR_UPDATED Avatar was updated.
 * @apiError (404) USER_NOT_FOUND There is no user with the id <code>userId</code>
 * @apiError (400) USER_AVATAR_WRONGFORMAT Your avatar is not a png or jpg file.
 * @apiError (403) AUTHENTICATION_BANNED Your account was banned. (Reason included in body)
 * @apiError (403) AUTHENTICATION_WRONG You are not allowed to perform this action.
 * @apiError (403) AUTHENTICATION_NEEDED You are not allowed to perform this action.
 */
async function putUpdateAvatarHandler(req, res) {
    if(isDev) console.log(chalk.grey("[mgg-server] (Users) Users->PutUpdateAvatar"));

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
    if(user.id !== req.userId && !['moderator', 'admin'].some(str => req.userRoles.includes(str))) {
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

/**
 * @api {delete} /user/:userId/avatar Deletes the avatar of a User
 * @apiName DeleteUserAvatar
 * @apiGroup Users
 * 
 * @apiHeader {String} x-access-token JWT Token for authentication
 * @apiParam {Integer} userId The ID of the User
 * 
 * @apiSuccess (201) USER_AVATAR_UPDATED Avatar was deleted.
 * @apiError (404) USER_NOT_FOUND There is no user with the id <code>userId</code>
 * @apiError (403) AUTHENTICATION_BANNED Your account was banned. (Reason included in body)
 * @apiError (403) AUTHENTICATION_WRONG You are not allowed to perform this action.
 * @apiError (403) AUTHENTICATION_NEEDED You are not allowed to perform this action.
 */
async function deleteUpdateAvatarHandler(req, res) {
    if(isDev) console.log(chalk.grey("[mgg-server] (Users) Users->DeleteUpdateAvatar"));

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
    if(user.id !== req.userId && !['moderator', 'admin'].some(str => req.userRoles.includes(str))) {
        res.status(403).json({name: "AUTHENTICATION_NEEDED", text: "You are not allowed to perform this action."});
        return;
    }

    deleteAvatar( user ).then(() => {
        res.status(200).json({name: "USER_AVATAR_UPDATED", text: "Avatar was deleted."});
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