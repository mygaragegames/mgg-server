define({ "api": [
  {
    "type": "post",
    "url": "/auth/login",
    "title": "Login a User",
    "name": "AuthLogin",
    "group": "Auth",
    "permission": [
      {
        "name": "Public"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "username",
            "description": "<p>Username</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>Password</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "Object",
            "optional": false,
            "field": "userData",
            "description": "<p>Object of the authenticated User</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>JWT Token for authenticated calls</p>"
          },
          {
            "group": "200",
            "type": "Array",
            "optional": false,
            "field": "roles",
            "description": "<p>Roles of the authenticated User</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "403": [
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_BANNED",
            "description": "<p>Your account was banned. (Reason included in body)</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_WRONG",
            "description": "<p>Password is not correct</p>"
          }
        ],
        "404": [
          {
            "group": "404",
            "optional": false,
            "field": "USER_NOT_FOUND",
            "description": "<p>There is no user with the username <code>username</code></p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/v1/auth.js",
    "groupTitle": "Auth"
  },
  {
    "type": "put",
    "url": "/auth/update/:userid",
    "title": "Updates a Users email/password",
    "name": "AuthUpdate",
    "group": "Auth",
    "permission": [
      {
        "name": "User"
      },
      {
        "name": "Moderator"
      },
      {
        "name": "Admin"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>JWT Token for authentication</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "userid",
            "description": "<p>The ID of the User</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>[Optional] New email for User</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>[Optional] New password for User</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "201": [
          {
            "group": "201",
            "optional": false,
            "field": "USER_UPDATED",
            "description": "<p>User was updated.</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "403": [
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_BANNED",
            "description": "<p>Your account was banned. (Reason included in body)</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_WRONG",
            "description": "<p>You are not allowed to perform this action.</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_NEEDED",
            "description": "<p>You are not allowed to perform this action.</p>"
          }
        ],
        "404": [
          {
            "group": "404",
            "optional": false,
            "field": "USER_NOT_FOUND",
            "description": "<p>There is no user with the id <code>id</code></p>"
          }
        ],
        "406": [
          {
            "group": "406",
            "optional": false,
            "field": "EMAIL_INVALID",
            "description": "<p>Email is not valid!</p>"
          }
        ],
        "409": [
          {
            "group": "409",
            "optional": false,
            "field": "USERNAME_EMAIL_CONFLICT",
            "description": "<p>Username or email is already in use!</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/v1/auth.js",
    "groupTitle": "Auth"
  },
  {
    "type": "post",
    "url": "/auth/verify",
    "title": "Verifies a JWT token",
    "name": "AuthVerify",
    "group": "Auth",
    "permission": [
      {
        "name": "Public"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>JWT Token</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "Object",
            "optional": false,
            "field": "userData",
            "description": "<p>Object of the authenticated User</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>JWT Token for authenticated calls</p>"
          },
          {
            "group": "200",
            "type": "Array",
            "optional": false,
            "field": "roles",
            "description": "<p>Roles of the authenticated User</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "403": [
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_BANNED",
            "description": "<p>Your account was banned. (Reason included in body)</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_WRONG",
            "description": "<p>Token is invalid</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/v1/auth.js",
    "groupTitle": "Auth"
  },
  {
    "type": "post",
    "url": "/oauth/discord/callback",
    "title": "Login a user with the received OAuth Code",
    "name": "OauthDiscordCallback",
    "group": "Auth",
    "permission": [
      {
        "name": "Public"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "callbackCode",
            "description": "<p>The received OAuth code</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "Object",
            "optional": false,
            "field": "userData",
            "description": "<p>Object of the authenticated User</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>JWT Token for authenticated calls</p>"
          },
          {
            "group": "200",
            "type": "Array",
            "optional": false,
            "field": "roles",
            "description": "<p>Roles of the authenticated User</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "403": [
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_BANNED",
            "description": "<p>Your account was banned. (Reason included in body)</p>"
          }
        ],
        "409": [
          {
            "group": "409",
            "optional": false,
            "field": "USERNAME_EMAIL_CONFLICT",
            "description": "<p>Username or email is already in use!</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/v1/oauth.js",
    "groupTitle": "Auth"
  },
  {
    "type": "get",
    "url": "/oauth/discord",
    "title": "Receive the correct OAuth login URL",
    "name": "OauthDiscordGetUrl",
    "group": "Auth",
    "permission": [
      {
        "name": "Public"
      }
    ],
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "string",
            "optional": false,
            "field": "url",
            "description": "<p>The URL for the OAuth login flow</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/v1/oauth.js",
    "groupTitle": "Auth"
  },
  {
    "type": "post",
    "url": "/discovery/find",
    "title": "Find games based on a condition",
    "name": "FindGames",
    "group": "Discovery",
    "permission": [
      {
        "name": "Public"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>(Optional) JWT Token for authentication</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "query",
            "description": "<p>Search Query</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "Array",
            "optional": false,
            "field": "games",
            "description": "<p>Array of Games</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/v1/discovery.js",
    "groupTitle": "Discovery"
  },
  {
    "type": "get",
    "url": "/discovery/hotThisWeek",
    "title": "Get the 12 most popular games released this week",
    "name": "GetHotThisWeekGames",
    "group": "Discovery",
    "permission": [
      {
        "name": "Public"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>(Optional) JWT Token for authentication</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "page",
            "description": "<p>Page (wraps every 12 games)</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "Array",
            "optional": false,
            "field": "games",
            "description": "<p>Array of Games</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/v1/discovery.js",
    "groupTitle": "Discovery"
  },
  {
    "type": "get",
    "url": "/discovery/newest",
    "title": "Get the 12 newest games",
    "name": "GetNewestGames",
    "group": "Discovery",
    "permission": [
      {
        "name": "Public"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>(Optional) JWT Token for authentication</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "page",
            "description": "<p>Page (wraps every 12 games)</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "Array",
            "optional": false,
            "field": "games",
            "description": "<p>Array of Games</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/v1/discovery.js",
    "groupTitle": "Discovery"
  },
  {
    "type": "get",
    "url": "/discovery/popular",
    "title": "Get the 12 most popular games",
    "name": "GetPopularGames",
    "group": "Discovery",
    "permission": [
      {
        "name": "Public"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>(Optional) JWT Token for authentication</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "page",
            "description": "<p>Page (wraps every 12 games)</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "Array",
            "optional": false,
            "field": "games",
            "description": "<p>Array of Games</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/v1/discovery.js",
    "groupTitle": "Discovery"
  },
  {
    "type": "get",
    "url": "/discovery/random",
    "title": "Get the 12 random games",
    "name": "GetRandomGames",
    "group": "Discovery",
    "permission": [
      {
        "name": "Public"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>(Optional) JWT Token for authentication</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "page",
            "description": "<p>Page (wraps every 12 games)</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "Array",
            "optional": false,
            "field": "games",
            "description": "<p>Array of Games</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/v1/discovery.js",
    "groupTitle": "Discovery"
  },
  {
    "type": "post",
    "url": "/gameChannels",
    "title": "Creates a GameChannel",
    "name": "CreateGameChannel",
    "group": "GameChannels",
    "permission": [
      {
        "name": "Moderator"
      },
      {
        "name": "Admin"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>JWT Token for authentication</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "title",
            "description": "<p>Title of the GameChannel</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "description",
            "description": "<p>Description of the GameChannel</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "201": [
          {
            "group": "201",
            "optional": false,
            "field": "GAMECHANNEL_CREATED",
            "description": "<p>Channel was created</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "403": [
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_BANNED",
            "description": "<p>Your account was banned. (Reason included in body)</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_WRONG",
            "description": "<p>You are not allowed to perform this action.</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_NEEDED",
            "description": "<p>You are not allowed to perform this action.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/v1/gameChannels.js",
    "groupTitle": "GameChannels"
  },
  {
    "type": "delete",
    "url": "/gameChannels/:channelId",
    "title": "Deletes a GameChannel",
    "name": "DeleteGameChannel",
    "group": "GameChannels",
    "permission": [
      {
        "name": "Moderator"
      },
      {
        "name": "Admin"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>JWT Token for authentication</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "channelId",
            "description": "<p>The ID of the GameChannel</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "GAMECHANNEL_DELETED",
            "description": "<p>Channel was deleted</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "403": [
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_BANNED",
            "description": "<p>Your account was banned. (Reason included in body)</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_WRONG",
            "description": "<p>You are not allowed to perform this action.</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_NEEDED",
            "description": "<p>You are not allowed to perform this action.</p>"
          }
        ],
        "404": [
          {
            "group": "404",
            "optional": false,
            "field": "GAMECHANNEL_NOT_FOUND",
            "description": "<p>There is no game channel with the id <code>channelId</code></p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/v1/gameChannels.js",
    "groupTitle": "GameChannels"
  },
  {
    "type": "get",
    "url": "/gameChannels",
    "title": "Get all available GameChannels",
    "name": "GetAllGameChannels",
    "group": "GameChannels",
    "permission": [
      {
        "name": "Public"
      }
    ],
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "Array",
            "optional": false,
            "field": "gameChannels",
            "description": "<p>Array of GameChannels</p>"
          },
          {
            "group": "200",
            "type": "Integer",
            "optional": false,
            "field": "gameChannels.id",
            "description": "<p>ID</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "gameChannels.title",
            "description": "<p>Title</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "gameChannels.description",
            "description": "<p>Description</p>"
          },
          {
            "group": "200",
            "type": "DateTime",
            "optional": false,
            "field": "gameChannels.createAt",
            "description": "<p>DateTime of creation</p>"
          },
          {
            "group": "200",
            "type": "DateTime",
            "optional": false,
            "field": "gameChannels.updatedAt",
            "description": "<p>DateTime of last change</p>"
          },
          {
            "group": "200",
            "type": "Integer",
            "optional": false,
            "field": "gameChannels.gamesCount",
            "description": "<p>The amount of games in this channel</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/v1/gameChannels.js",
    "groupTitle": "GameChannels"
  },
  {
    "type": "get",
    "url": "/gameChannels/:channelId",
    "title": "Get detailled information and list of games from a GameChannel",
    "name": "GetOneGameChannel",
    "group": "GameChannels",
    "permission": [
      {
        "name": "Public"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>(Optional) JWT Token for authentication</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "channelId",
            "description": "<p>The ID of the GameChannel</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "Integer",
            "optional": false,
            "field": "id",
            "description": "<p>ID</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "title",
            "description": "<p>Title</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "description",
            "description": "<p>Description</p>"
          },
          {
            "group": "200",
            "type": "DateTime",
            "optional": false,
            "field": "createAt",
            "description": "<p>DateTime of creation</p>"
          },
          {
            "group": "200",
            "type": "DateTime",
            "optional": false,
            "field": "updatedAt",
            "description": "<p>DateTime of last change</p>"
          },
          {
            "group": "200",
            "type": "Array",
            "optional": false,
            "field": "games",
            "description": "<p>Array of Games in this Channel</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "404": [
          {
            "group": "404",
            "optional": false,
            "field": "GAMECHANNEL_NOT_FOUND",
            "description": "<p>There is no game channel with the id <code>channelId</code></p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/v1/gameChannels.js",
    "groupTitle": "GameChannels"
  },
  {
    "type": "put",
    "url": "/gameChannels/:channelId",
    "title": "Updates a GameChannel",
    "name": "UpdateGameChannel",
    "group": "GameChannels",
    "permission": [
      {
        "name": "Moderator"
      },
      {
        "name": "Admin"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>JWT Token for authentication</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "channelId",
            "description": "<p>The ID of the GameChannel</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "title",
            "description": "<p>New title of the GameChannel</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "description",
            "description": "<p>New description of the GameChannel</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "GAMECHANNEL_UPDATED",
            "description": "<p>Channel was updated</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "403": [
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_BANNED",
            "description": "<p>Your account was banned. (Reason included in body)</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_WRONG",
            "description": "<p>You are not allowed to perform this action.</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_NEEDED",
            "description": "<p>You are not allowed to perform this action.</p>"
          }
        ],
        "404": [
          {
            "group": "404",
            "optional": false,
            "field": "GAMECHANNEL_NOT_FOUND",
            "description": "<p>There is no game channel with the id <code>channelId</code></p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/v1/gameChannels.js",
    "groupTitle": "GameChannels"
  },
  {
    "type": "post",
    "url": "/gameComments/:gameId",
    "title": "Creates a GameComment",
    "name": "CreateGameComment",
    "group": "GameComments",
    "permission": [
      {
        "name": "User"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>JWT Token for authentication</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "text",
            "description": "<p>Text of the GameComment</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "201": [
          {
            "group": "201",
            "optional": false,
            "field": "GAMECOMMENT_CREATED",
            "description": "<p>Comment was created</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "403": [
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_BANNED",
            "description": "<p>Your account was banned. (Reason included in body)</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_WRONG",
            "description": "<p>You are not allowed to perform this action.</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_NEEDED",
            "description": "<p>You are not allowed to perform this action.</p>"
          }
        ],
        "404": [
          {
            "group": "404",
            "optional": false,
            "field": "GAME_NOT_FOUND",
            "description": "<p>There is no game with the id <code>gameId</code></p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/v1/gameComments.js",
    "groupTitle": "GameComments"
  },
  {
    "type": "delete",
    "url": "/gameComments/:commentId",
    "title": "Deletes a GameComment",
    "name": "DeleteGameComment",
    "group": "GameComments",
    "permission": [
      {
        "name": "User"
      },
      {
        "name": "Moderator"
      },
      {
        "name": "Admin"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>JWT Token for authentication</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "commentId",
            "description": "<p>The ID of the GameComment</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "GAMECOMMENT_DELETED",
            "description": "<p>Comment was deleted</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "403": [
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_BANNED",
            "description": "<p>Your account was banned. (Reason included in body)</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_WRONG",
            "description": "<p>You are not allowed to perform this action.</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_NEEDED",
            "description": "<p>You are not allowed to perform this action.</p>"
          }
        ],
        "404": [
          {
            "group": "404",
            "optional": false,
            "field": "GAMECOMMENT_NOT_FOUND",
            "description": "<p>There is no game comment with the id <code>commentId</code></p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/v1/gameComments.js",
    "groupTitle": "GameComments"
  },
  {
    "type": "get",
    "url": "/gameComments/:commentId",
    "title": "Get detailled information data from a GameComment",
    "name": "GetOneGameComment",
    "group": "GameComments",
    "permission": [
      {
        "name": "Public"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "gameId",
            "description": "<p>The ID of the GameComment</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "Integer",
            "optional": false,
            "field": "id",
            "description": "<p>ID</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "text",
            "description": "<p>Comment Body</p>"
          },
          {
            "group": "200",
            "type": "DateTime",
            "optional": false,
            "field": "createdAt",
            "description": "<p>DateTime of creation</p>"
          },
          {
            "group": "200",
            "type": "DateTime",
            "optional": false,
            "field": "updatedAt",
            "description": "<p>DateTime of last change</p>"
          },
          {
            "group": "200",
            "type": "Integer",
            "optional": false,
            "field": "gameId",
            "description": "<p>ID of the Game from the Comment</p>"
          },
          {
            "group": "200",
            "type": "Integer",
            "optional": false,
            "field": "userId",
            "description": "<p>ID of the User who created the Comment</p>"
          },
          {
            "group": "200",
            "type": "Object",
            "optional": false,
            "field": "user",
            "description": "<p>Object of the User who created the Comment</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "404": [
          {
            "group": "404",
            "optional": false,
            "field": "GAMECOMMENT_NOT_FOUND",
            "description": "<p>There is no game comment with the id <code>commentId</code></p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/v1/gameComments.js",
    "groupTitle": "GameComments"
  },
  {
    "type": "put",
    "url": "/gameComments/:commentId",
    "title": "Updates a GameComment",
    "name": "UpdateGameComment",
    "group": "GameComments",
    "permission": [
      {
        "name": "User"
      },
      {
        "name": "Moderator"
      },
      {
        "name": "Admin"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>JWT Token for authentication</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "commentId",
            "description": "<p>The ID of the GameComment</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "text",
            "description": "<p>New text of the GameComment</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "GAMECOMMENT_UPDATED",
            "description": "<p>Comment was updated</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "403": [
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_BANNED",
            "description": "<p>Your account was banned. (Reason included in body)</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_WRONG",
            "description": "<p>You are not allowed to perform this action.</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_NEEDED",
            "description": "<p>You are not allowed to perform this action.</p>"
          }
        ],
        "404": [
          {
            "group": "404",
            "optional": false,
            "field": "GAMECOMMENT_NOT_FOUND",
            "description": "<p>There is no game comment with the id <code>commentId</code></p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/v1/gameComments.js",
    "groupTitle": "GameComments"
  },
  {
    "type": "delete",
    "url": "/gameScreenshots/:screenshotId",
    "title": "Deletes a GameScreenshot",
    "name": "DeleteGameScreenshot",
    "group": "GameScreenshots",
    "permission": [
      {
        "name": "Public"
      },
      {
        "name": "Moderator"
      },
      {
        "name": "Admin"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>JWT Token for authentication</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "screenshotId",
            "description": "<p>The ID of the GameScreenshot</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "GAMESCREENSHOT_DELETED",
            "description": "<p>Screenshot was deleted</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "403": [
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_BANNED",
            "description": "<p>Your account was banned. (Reason included in body)</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_WRONG",
            "description": "<p>You are not allowed to perform this action.</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_NEEDED",
            "description": "<p>You are not allowed to perform this action.</p>"
          }
        ],
        "404": [
          {
            "group": "404",
            "optional": false,
            "field": "GAMESCREENSHOT_NOT_FOUND",
            "description": "<p>There is no game screenshot with the id <code>screenshotId</code></p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/v1/gameScreenshots.js",
    "groupTitle": "GameScreenshots"
  },
  {
    "type": "post",
    "url": "/gameScreenshots/:gameId",
    "title": "Uploads a screenshot",
    "name": "UploadGameScreenshot",
    "group": "GameScreenshots",
    "permission": [
      {
        "name": "User"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>JWT Token for authentication</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "gameId",
            "description": "<p>The ID of the Game</p>"
          },
          {
            "group": "Parameter",
            "type": "Array",
            "optional": false,
            "field": "screenshots",
            "description": "<p>multipart/form-data array of png or jpg files</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "201": [
          {
            "group": "201",
            "optional": false,
            "field": "GAMESCREENSHOTS_UPLOADED",
            "description": "<p>Comment were uploaded</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "400": [
          {
            "group": "400",
            "optional": false,
            "field": "GAMESCREENSHOT_COVER_WRONGFORMAT",
            "description": "<p>One or more screenshots are not a png or jpg file</p>"
          }
        ],
        "403": [
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_BANNED",
            "description": "<p>Your account was banned. (Reason included in body)</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_WRONG",
            "description": "<p>You are not allowed to perform this action.</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_NEEDED",
            "description": "<p>You are not allowed to perform this action.</p>"
          }
        ],
        "404": [
          {
            "group": "404",
            "optional": false,
            "field": "GAME_NOT_FOUND",
            "description": "<p>There is no game with the id <code>gameId</code></p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/v1/gameScreenshots.js",
    "groupTitle": "GameScreenshots"
  },
  {
    "type": "post",
    "url": "/games",
    "title": "Create a Game",
    "name": "CreateGame",
    "group": "Games",
    "permission": [
      {
        "name": "User"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>JWT Token for authentication</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "title",
            "description": "<p>Title</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "description",
            "description": "<p>(Optional) Description</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "ingameID",
            "description": "<p>Ingame-ID (Syntax: G-000-000-000)</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "displayStatus",
            "description": "<p>(Optional) Visibility of the Game. 0 = Public, 1 = Hidden, 2 = Private</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "youtubeID",
            "description": "<p>(Optional) Trailer YouTube-URL of the Game</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "themeFont",
            "description": "<p>Font for the theme of the Game's page</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "themeColor",
            "description": "<p>Primary color for the theme of the Game's page</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "Integer",
            "optional": false,
            "field": "id",
            "description": "<p>ID</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "title",
            "description": "<p>Title</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "ingameID",
            "description": "<p>Ingame-ID</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "description",
            "description": "<p>(Optional) Description</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "coverFileName",
            "description": "<p>URL of the cover</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "youtubeID",
            "description": "<p>(Optional) Trailer YouTube-ID of the Game</p>"
          },
          {
            "group": "200",
            "type": "Integer",
            "optional": false,
            "field": "displayStatus",
            "description": "<p>Visibility of the Game. 0 = Public, 1 = Hidden, 2 = Private</p>"
          },
          {
            "group": "200",
            "type": "Integer",
            "optional": false,
            "field": "themeFont",
            "description": "<p>Font for the theme of the Game's page</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "themeColor",
            "description": "<p>Primary color for the theme of the Game's page</p>"
          },
          {
            "group": "200",
            "type": "Boolean",
            "optional": false,
            "field": "isInQueue",
            "description": "<p>Was this game manually checked by a moderator?</p>"
          },
          {
            "group": "200",
            "type": "DateTime",
            "optional": false,
            "field": "createAt",
            "description": "<p>DateTime of creation</p>"
          },
          {
            "group": "200",
            "type": "DateTime",
            "optional": false,
            "field": "updatedAt",
            "description": "<p>DateTime of last change</p>"
          },
          {
            "group": "200",
            "type": "Integer",
            "optional": false,
            "field": "userId",
            "description": "<p>ID of the User who created the Game</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "400": [
          {
            "group": "400",
            "optional": false,
            "field": "GAME_GAMEID_WRONGFORMAT",
            "description": "<p>The ingame ID has the wrong format (G-000-000-000).</p>"
          }
        ],
        "403": [
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_BANNED",
            "description": "<p>Your account was banned. (Reason included in body)</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_WRONG",
            "description": "<p>You are not allowed to perform this action.</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_NEEDED",
            "description": "<p>You are not allowed to perform this action.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/v1/games.js",
    "groupTitle": "Games"
  },
  {
    "type": "delete",
    "url": "/games/:gameId",
    "title": "Deletes a Game",
    "name": "DeleteGame",
    "group": "Games",
    "permission": [
      {
        "name": "User"
      },
      {
        "name": "Moderator"
      },
      {
        "name": "Admin"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>JWT Token for authentication</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "gameId",
            "description": "<p>ID of the Game</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "201": [
          {
            "group": "201",
            "optional": false,
            "field": "GAME_DELETED",
            "description": "<p>Game was deleted.</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "403": [
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_BANNED",
            "description": "<p>Your account was banned. (Reason included in body)</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_WRONG",
            "description": "<p>You are not allowed to perform this action.</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_NEEDED",
            "description": "<p>You are not allowed to perform this action.</p>"
          }
        ],
        "404": [
          {
            "group": "404",
            "optional": false,
            "field": "GAME_NOT_FOUND",
            "description": "<p>There is no game with the id <code>gameId</code></p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/v1/games.js",
    "groupTitle": "Games"
  },
  {
    "type": "delete",
    "url": "/game/:gameId/cover",
    "title": "Deletes the cover of a Game",
    "name": "DeleteGameCover",
    "group": "Games",
    "permission": [
      {
        "name": "Public"
      },
      {
        "name": "Moderator"
      },
      {
        "name": "Admin"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>JWT Token for authentication</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "gameId",
            "description": "<p>The ID of the Game</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "201": [
          {
            "group": "201",
            "optional": false,
            "field": "GAME_COVER_UPDATED",
            "description": "<p>Cover of game was deleted.</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "403": [
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_BANNED",
            "description": "<p>Your account was banned. (Reason included in body)</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_WRONG",
            "description": "<p>You are not allowed to perform this action.</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_NEEDED",
            "description": "<p>You are not allowed to perform this action.</p>"
          }
        ],
        "404": [
          {
            "group": "404",
            "optional": false,
            "field": "GAME_NOT_FOUND",
            "description": "<p>There is no game with the id <code>gameId</code></p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/v1/games.js",
    "groupTitle": "Games"
  },
  {
    "type": "get",
    "url": "/games/:gameId",
    "title": "Get detailled information from a Game",
    "name": "GetOneGame",
    "group": "Games",
    "permission": [
      {
        "name": "Public"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>(Optional) JWT Token for authentication</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "gameId",
            "description": "<p>The ID of the Game</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "Object",
            "optional": false,
            "field": "game",
            "description": "<p>Object of the Game</p>"
          },
          {
            "group": "200",
            "type": "Integer",
            "optional": false,
            "field": "game.id",
            "description": "<p>ID</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "game.title",
            "description": "<p>Title</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "game.ingameID",
            "description": "<p>Ingame-ID</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "game.description",
            "description": "<p>Description</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "game.coverFileName",
            "description": "<p>URL of the cover</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "game.youtubeID",
            "description": "<p>Trailer YouTube-ID of the Game</p>"
          },
          {
            "group": "200",
            "type": "Integer",
            "optional": false,
            "field": "game.displayStatus",
            "description": "<p>Visibility of the Game. 0 = Public, 1 = Hidden, 2 = Private</p>"
          },
          {
            "group": "200",
            "type": "Integer",
            "optional": false,
            "field": "game.themeFont",
            "description": "<p>Font for the theme of the Game's page</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "game.themeColor",
            "description": "<p>Primary color for the theme of the Game's page</p>"
          },
          {
            "group": "200",
            "type": "Boolean",
            "optional": false,
            "field": "game.isInQueue",
            "description": "<p>Was this game manually checked by a moderator?</p>"
          },
          {
            "group": "200",
            "type": "DateTime",
            "optional": false,
            "field": "game.createAt",
            "description": "<p>DateTime of creation</p>"
          },
          {
            "group": "200",
            "type": "DateTime",
            "optional": false,
            "field": "game.updatedAt",
            "description": "<p>DateTime of last change</p>"
          },
          {
            "group": "200",
            "type": "Integer",
            "optional": false,
            "field": "game.userId",
            "description": "<p>ID of the User who created the Game</p>"
          },
          {
            "group": "200",
            "type": "Integer",
            "optional": false,
            "field": "game.user",
            "description": "<p>Object of the User who created the Game</p>"
          },
          {
            "group": "200",
            "type": "Array",
            "optional": false,
            "field": "game.screenshots",
            "description": "<p>Array of GameScreenshots</p>"
          },
          {
            "group": "200",
            "type": "Array",
            "optional": false,
            "field": "game.channels",
            "description": "<p>Array of GameChannels the Game is part of</p>"
          },
          {
            "group": "200",
            "type": "Array",
            "optional": false,
            "field": "game.comments",
            "description": "<p>Array of GameComments of the Game</p>"
          },
          {
            "group": "200",
            "type": "Boolean",
            "optional": false,
            "field": "isInPlaylist",
            "description": "<p>If a JWT Token is provided, this bool will be true if the Game is in the &quot;Play later&quot; playlist of the User</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "403": [
          {
            "group": "403",
            "optional": false,
            "field": "GAME_PRIVATE",
            "description": "<p>You are not allowed to see this game.</p>"
          }
        ],
        "404": [
          {
            "group": "404",
            "optional": false,
            "field": "GAME_NOT_FOUND",
            "description": "<p>There is no game with the id <code>gameId</code></p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/v1/games.js",
    "groupTitle": "Games"
  },
  {
    "type": "put",
    "url": "/games/:gameId",
    "title": "Update a Game",
    "name": "UpdateGame",
    "group": "Games",
    "permission": [
      {
        "name": "User"
      },
      {
        "name": "Moderator"
      },
      {
        "name": "Admin"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>JWT Token for authentication</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "gameId",
            "description": "<p>ID of the Game</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "title",
            "description": "<p>(Optional) Title</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "description",
            "description": "<p>(Optional) Description</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "ingameID",
            "description": "<p>(Optional) Ingame-ID (Syntax: G-000-000-000)</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "displayStatus",
            "description": "<p>(Optional) Visibility of the Game. 0 = Public, 1 = Hidden, 2 = Private</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "youtubeID",
            "description": "<p>(Optional) Trailer YouTube-URL of the Game</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "themeFont",
            "description": "<p>Font for the theme of the Game's page</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "themeColor",
            "description": "<p>Primary color for the theme of the Game's page</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "201": [
          {
            "group": "201",
            "optional": false,
            "field": "GAME_UPDATED",
            "description": "<p>Game was updated.</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "400": [
          {
            "group": "400",
            "optional": false,
            "field": "GAME_GAMEID_WRONGFORMAT",
            "description": "<p>The ingame ID has the wrong format (G-000-000-000).</p>"
          }
        ],
        "403": [
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_BANNED",
            "description": "<p>Your account was banned. (Reason included in body)</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_WRONG",
            "description": "<p>You are not allowed to perform this action.</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_NEEDED",
            "description": "<p>You are not allowed to perform this action.</p>"
          }
        ],
        "404": [
          {
            "group": "404",
            "optional": false,
            "field": "GAME_NOT_FOUND",
            "description": "<p>There is no game with the id <code>gameId</code></p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/v1/games.js",
    "groupTitle": "Games"
  },
  {
    "type": "put",
    "url": "/game/:gameId/cover",
    "title": "Uploads a cover to a Game",
    "name": "UploadGameCover",
    "group": "Games",
    "permission": [
      {
        "name": "User"
      },
      {
        "name": "Moderator"
      },
      {
        "name": "Admin"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>JWT Token for authentication</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "gameId",
            "description": "<p>The ID of the Game</p>"
          },
          {
            "group": "Parameter",
            "type": "File",
            "optional": false,
            "field": "cover",
            "description": "<p>multipart/form-data of a png or jpg file</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "201": [
          {
            "group": "201",
            "optional": false,
            "field": "GAME_COVER_UPDATED",
            "description": "<p>Cover of game was updated.</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "400": [
          {
            "group": "400",
            "optional": false,
            "field": "GAME_COVER_WRONGFORMAT",
            "description": "<p>Your cover is not a png or jpg file.</p>"
          }
        ],
        "403": [
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_BANNED",
            "description": "<p>Your account was banned. (Reason included in body)</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_WRONG",
            "description": "<p>You are not allowed to perform this action.</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_NEEDED",
            "description": "<p>You are not allowed to perform this action.</p>"
          }
        ],
        "404": [
          {
            "group": "404",
            "optional": false,
            "field": "GAME_NOT_FOUND",
            "description": "<p>There is no game with the id <code>gameId</code></p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/v1/games.js",
    "groupTitle": "Games"
  },
  {
    "type": "put",
    "url": "/ban/:userId",
    "title": "Bans a User",
    "name": "BanUser",
    "group": "Moderation",
    "permission": [
      {
        "name": "User"
      },
      {
        "name": "Moderator"
      },
      {
        "name": "Admin"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>JWT Token for authentication</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "userId",
            "description": "<p>The ID of the User</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "reason",
            "description": "<p>Ban reason (displayed to user)</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "201": [
          {
            "group": "201",
            "optional": false,
            "field": "USER_UPDATED",
            "description": "<p>User was banned.</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "403": [
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_BANNED",
            "description": "<p>Your account was banned. (Reason included in body)</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_WRONG",
            "description": "<p>You are not allowed to perform this action.</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_NEEDED",
            "description": "<p>You are not allowed to perform this action.</p>"
          }
        ],
        "404": [
          {
            "group": "404",
            "optional": false,
            "field": "USER_NOT_FOUND",
            "description": "<p>There is no user with the id <code>userId</code></p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/v1/modBan.js",
    "groupTitle": "Moderation"
  },
  {
    "type": "delete",
    "url": "/queue/:gameId",
    "title": "Deletes a game from the moderation queue",
    "name": "DeleteFromModerationQueue",
    "group": "Moderation",
    "permission": [
      {
        "name": "Moderator"
      },
      {
        "name": "Admin"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>JWT Token for authentication</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "gameId",
            "description": "<p>The ID of the User</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "201": [
          {
            "group": "201",
            "optional": false,
            "field": "GAME_UPDATED",
            "description": "<p>Game was deleted from the moderation queue</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "403": [
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_BANNED",
            "description": "<p>Your account was banned. (Reason included in body)</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_WRONG",
            "description": "<p>You are not allowed to perform this action.</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_NEEDED",
            "description": "<p>You are not allowed to perform this action.</p>"
          }
        ],
        "404": [
          {
            "group": "404",
            "optional": false,
            "field": "GAME_NOT_FOUND",
            "description": "<p>There is no game with the id <code>gameId</code></p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/v1/modQueue.js",
    "groupTitle": "Moderation"
  },
  {
    "type": "get",
    "url": "/queue",
    "title": "Get all games in the moderation queue",
    "name": "GetModerationQueue",
    "group": "Moderation",
    "permission": [
      {
        "name": "Moderator"
      },
      {
        "name": "Admin"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>JWT Token for authentication</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "Object",
            "optional": false,
            "field": "game",
            "description": "<p>Object of the Game</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "403": [
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_BANNED",
            "description": "<p>Your account was banned. (Reason included in body)</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_WRONG",
            "description": "<p>You are not allowed to perform this action.</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_NEEDED",
            "description": "<p>You are not allowed to perform this action.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/v1/modQueue.js",
    "groupTitle": "Moderation"
  },
  {
    "type": "delete",
    "url": "/ban/:userId",
    "title": "Deletes the ban of a User",
    "name": "UnbanUser",
    "group": "Moderation",
    "permission": [
      {
        "name": "Moderator"
      },
      {
        "name": "Admin"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>JWT Token for authentication</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "userId",
            "description": "<p>The ID of the User</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "201": [
          {
            "group": "201",
            "optional": false,
            "field": "USER_UPDATED",
            "description": "<p>User was unbanned.</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "403": [
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_BANNED",
            "description": "<p>Your account was banned. (Reason included in body)</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_WRONG",
            "description": "<p>You are not allowed to perform this action.</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_NEEDED",
            "description": "<p>You are not allowed to perform this action.</p>"
          }
        ],
        "404": [
          {
            "group": "404",
            "optional": false,
            "field": "USER_NOT_FOUND",
            "description": "<p>There is no user with the id <code>userId</code></p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/v1/modBan.js",
    "groupTitle": "Moderation"
  },
  {
    "type": "post",
    "url": "/playlists/:playlistId/add/:gameId",
    "title": "Adds a Game to a Playlist",
    "name": "AddToPlaylist",
    "group": "Playlists",
    "permission": [
      {
        "name": "User"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>JWT Token for authentication</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "playlistId",
            "description": "<p>The ID of the Playlist</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "gameId",
            "description": "<p>The ID of the Game</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "201": [
          {
            "group": "201",
            "optional": false,
            "field": "PLAYLIST_GAME_ADDED",
            "description": "<p>Game was added to playlist.</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "403": [
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_BANNED",
            "description": "<p>Your account was banned. (Reason included in body)</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_WRONG",
            "description": "<p>You are not allowed to perform this action.</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_NEEDED",
            "description": "<p>You are not allowed to perform this action.</p>"
          }
        ],
        "404": [
          {
            "group": "404",
            "optional": false,
            "field": "PLAYLIST_NOT_FOUND",
            "description": "<p>There is no playlist with the id <code>playlistId</code></p>"
          },
          {
            "group": "404",
            "optional": false,
            "field": "GAME_NOT_FOUND",
            "description": "<p>There is no game with the id <code>gameId</code></p>"
          }
        ],
        "409": [
          {
            "group": "409",
            "optional": false,
            "field": "PLAYLIST_GAME_CONFLICT",
            "description": "<p>Game is already in playlist.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/v1/playlists.js",
    "groupTitle": "Playlists"
  },
  {
    "type": "post",
    "url": "/playlists",
    "title": "Creates a Playlist",
    "name": "CreatePlaylist",
    "group": "Playlists",
    "permission": [
      {
        "name": "User"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>JWT Token for authentication</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "title",
            "description": "<p>Title of the Playlist</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "201": [
          {
            "group": "201",
            "type": "Integer",
            "optional": false,
            "field": "id",
            "description": "<p>ID</p>"
          },
          {
            "group": "201",
            "type": "String",
            "optional": false,
            "field": "title",
            "description": "<p>Title</p>"
          },
          {
            "group": "201",
            "type": "DateTime",
            "optional": false,
            "field": "createAt",
            "description": "<p>DateTime of creation</p>"
          },
          {
            "group": "201",
            "type": "DateTime",
            "optional": false,
            "field": "updatedAt",
            "description": "<p>DateTime of last change</p>"
          },
          {
            "group": "201",
            "type": "Integer",
            "optional": false,
            "field": "userId",
            "description": "<p>ID of the User who created the playlist</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "403": [
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_BANNED",
            "description": "<p>Your account was banned. (Reason included in body)</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_WRONG",
            "description": "<p>You are not allowed to perform this action.</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_NEEDED",
            "description": "<p>You are not allowed to perform this action.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/v1/playlists.js",
    "groupTitle": "Playlists"
  },
  {
    "type": "delete",
    "url": "/playlists/:playlistId/delete/:gameId",
    "title": "Deletes a Game from a Playlist",
    "name": "DeleteFromPlaylist",
    "group": "Playlists",
    "permission": [
      {
        "name": "User"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>JWT Token for authentication</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "playlistId",
            "description": "<p>The ID of the Playlist</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "gameId",
            "description": "<p>The ID of the Game</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "PLAYLIST_GAME_REMOVED",
            "description": "<p>Game was deleted from playlist.</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "403": [
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_BANNED",
            "description": "<p>Your account was banned. (Reason included in body)</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_WRONG",
            "description": "<p>You are not allowed to perform this action.</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_NEEDED",
            "description": "<p>You are not allowed to perform this action.</p>"
          }
        ],
        "404": [
          {
            "group": "404",
            "optional": false,
            "field": "PLAYLIST_NOT_FOUND",
            "description": "<p>There is no playlist with the id <code>playlistId</code></p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/v1/playlists.js",
    "groupTitle": "Playlists"
  },
  {
    "type": "delete",
    "url": "/playlists/:playlistId/",
    "title": "Deletes a Playlist",
    "name": "DeletePlaylist",
    "group": "Playlists",
    "permission": [
      {
        "name": "User"
      },
      {
        "name": "Moderator"
      },
      {
        "name": "Admin"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>JWT Token for authentication</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "playlistId",
            "description": "<p>The ID of the Playlist</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "PLAYLIST_REMOVED",
            "description": "<p>Playlist was deleted.</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "403": [
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_BANNED",
            "description": "<p>Your account was banned. (Reason included in body)</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_WRONG",
            "description": "<p>You are not allowed to perform this action.</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_NEEDED",
            "description": "<p>You are not allowed to perform this action.</p>"
          }
        ],
        "404": [
          {
            "group": "404",
            "optional": false,
            "field": "PLAYLIST_NOT_FOUND",
            "description": "<p>There is no playlist with the id <code>playlistId</code></p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/v1/playlists.js",
    "groupTitle": "Playlists"
  },
  {
    "type": "get",
    "url": "/playlists/:playlistId",
    "title": "Get detailled information data from a Playlist",
    "name": "GetOnePlaylist",
    "group": "Playlists",
    "permission": [
      {
        "name": "User"
      },
      {
        "name": "Moderator"
      },
      {
        "name": "Admin"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>(Optional) JWT Token for authentication</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "playlistId",
            "description": "<p>The ID of the Playlist</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "Integer",
            "optional": false,
            "field": "id",
            "description": "<p>ID</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "title",
            "description": "<p>Title</p>"
          },
          {
            "group": "200",
            "type": "DateTime",
            "optional": false,
            "field": "createAt",
            "description": "<p>DateTime of creation</p>"
          },
          {
            "group": "200",
            "type": "DateTime",
            "optional": false,
            "field": "updatedAt",
            "description": "<p>DateTime of last change</p>"
          },
          {
            "group": "200",
            "type": "Integer",
            "optional": false,
            "field": "userId",
            "description": "<p>ID of the User who created the playlist</p>"
          },
          {
            "group": "200",
            "type": "Object",
            "optional": false,
            "field": "user",
            "description": "<p>Object of the User who created the playlist</p>"
          },
          {
            "group": "200",
            "type": "Array",
            "optional": false,
            "field": "games",
            "description": "<p>Array of Games in the Playlist</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "403": [
          {
            "group": "403",
            "optional": false,
            "field": "PLAYLIST_PRIVATE",
            "description": "<p>You are not allowed to see this playlist.</p>"
          }
        ],
        "404": [
          {
            "group": "404",
            "optional": false,
            "field": "PLAYLIST_NOT_FOUND",
            "description": "<p>There is no playlist with the id <code>playlistId</code></p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/v1/playlists.js",
    "groupTitle": "Playlists"
  },
  {
    "type": "put",
    "url": "/playlists/:playlistId",
    "title": "Updates a Playlist",
    "name": "UpdatePlaylist",
    "group": "Playlists",
    "permission": [
      {
        "name": "User"
      },
      {
        "name": "Moderator"
      },
      {
        "name": "Admin"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>JWT Token for authentication</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "playlistId",
            "description": "<p>The ID of the Playlist</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "title",
            "description": "<p>New title of the Playlist</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "201": [
          {
            "group": "201",
            "optional": false,
            "field": "PLAYLIST_UPDATED",
            "description": "<p>Playlist was updated.</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "403": [
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_BANNED",
            "description": "<p>Your account was banned. (Reason included in body)</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_WRONG",
            "description": "<p>You are not allowed to perform this action.</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_NEEDED",
            "description": "<p>You are not allowed to perform this action.</p>"
          }
        ],
        "404": [
          {
            "group": "404",
            "optional": false,
            "field": "PLAYLIST_NOT_FOUND",
            "description": "<p>There is no playlist with the id <code>playlistId</code></p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/v1/playlists.js",
    "groupTitle": "Playlists"
  },
  {
    "type": "post",
    "url": "/users",
    "title": "Creates a User",
    "name": "CreateUser",
    "group": "Users",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "username",
            "description": "<p>Username for the User</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>Password for the User</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>Email for the User</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "pronouns",
            "description": "<p>(Optional) Pronouns for the User</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "gameID",
            "description": "<p>(Optional) Ingame-ID for the User</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "socialDiscord",
            "description": "<p>(Optional) Discord username for the User</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "socialTwitter",
            "description": "<p>(Optional) Twitter username for the User</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "socialYouTube",
            "description": "<p>(Optional) YouTube username for the User</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "201": [
          {
            "group": "201",
            "type": "Object",
            "optional": false,
            "field": "User",
            "description": "<p>object of created user</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "406": [
          {
            "group": "406",
            "optional": false,
            "field": "USERNAME_INVALID",
            "description": "<p>Username is not valid!</p>"
          },
          {
            "group": "406",
            "optional": false,
            "field": "EMAIL_INVALID",
            "description": "<p>Email is not valid!</p>"
          },
          {
            "group": "406",
            "optional": false,
            "field": "USER_INGAMEID_WRONGFORMAT",
            "description": "<p>The ingame ID has the wrong format (P-000-000-000).</p>"
          }
        ],
        "409": [
          {
            "group": "409",
            "optional": false,
            "field": "USERNAME_EMAIL_CONFLICT",
            "description": "<p>Username or email is already in use.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/v1/users.js",
    "groupTitle": "Users"
  },
  {
    "type": "delete",
    "url": "/user/:userId/avatar",
    "title": "Deletes the avatar of a User",
    "name": "DeleteUserAvatar",
    "group": "Users",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>JWT Token for authentication</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "userId",
            "description": "<p>The ID of the User</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "201": [
          {
            "group": "201",
            "optional": false,
            "field": "USER_AVATAR_UPDATED",
            "description": "<p>Avatar was deleted.</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "403": [
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_BANNED",
            "description": "<p>Your account was banned. (Reason included in body)</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_WRONG",
            "description": "<p>You are not allowed to perform this action.</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_NEEDED",
            "description": "<p>You are not allowed to perform this action.</p>"
          }
        ],
        "404": [
          {
            "group": "404",
            "optional": false,
            "field": "USER_NOT_FOUND",
            "description": "<p>There is no user with the id <code>userId</code></p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/v1/users.js",
    "groupTitle": "Users"
  },
  {
    "type": "get",
    "url": "/users",
    "title": "Get all users",
    "name": "GetAllUsers",
    "group": "Users",
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "Array",
            "optional": false,
            "field": "users",
            "description": "<p>Array of users</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/v1/users.js",
    "groupTitle": "Users"
  },
  {
    "type": "get",
    "url": "/users/:userId",
    "title": "Get detailled information from a user",
    "name": "GetOneUsers",
    "group": "Users",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>(Optional) JWT Token for authentication</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "userId",
            "description": "<p>The ID of the User</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "Integer",
            "optional": false,
            "field": "id",
            "description": "<p>ID of the User</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "username",
            "description": "<p>Username</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "avatarFileName",
            "description": "<p>URL to the Users avatar</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "pronouns",
            "description": "<p>Chosen pronouns</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "ingameID",
            "description": "<p>Ingame-ID</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "socialDiscord",
            "description": "<p>Discord username of the User</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "socialTwitter",
            "description": "<p>Twitter username of the User</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "socialYouTube",
            "description": "<p>YouTube username of the User</p>"
          },
          {
            "group": "200",
            "type": "DateTime",
            "optional": false,
            "field": "createdAt",
            "description": "<p>Join date of the User</p>"
          },
          {
            "group": "200",
            "type": "DateTime",
            "optional": false,
            "field": "updatedDate",
            "description": "<p>Last time the User updated their profile</p>"
          },
          {
            "group": "200",
            "type": "Array",
            "optional": false,
            "field": "playlists",
            "description": "<p>Playlists created by the User (currently called &quot;Play Later&quot;)</p>"
          },
          {
            "group": "200",
            "type": "Array",
            "optional": false,
            "field": "comments",
            "description": "<p>Comments posted by the User</p>"
          },
          {
            "group": "200",
            "type": "Array",
            "optional": false,
            "field": "games",
            "description": "<p>Games published by the User</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "404": [
          {
            "group": "404",
            "optional": false,
            "field": "USER_NOT_FOUND",
            "description": "<p>There is no user with the id <code>:userId</code></p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/v1/users.js",
    "groupTitle": "Users"
  },
  {
    "type": "put",
    "url": "/users/:userId",
    "title": "Updates a User",
    "name": "UpdateUser",
    "group": "Users",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>JWT Token for authentication</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "userId",
            "description": "<p>The ID of the User</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "username",
            "description": "<p>(Optional) Username for the User</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "pronouns",
            "description": "<p>(Optional) Pronouns for the User</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "gameID",
            "description": "<p>(Optional) Ingame-ID for the User</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "socialDiscord",
            "description": "<p>(Optional) Discord username for the User</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "socialTwitter",
            "description": "<p>(Optional) Twitter username for the User</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "socialYouTube",
            "description": "<p>(Optional) YouTube username for the User</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "201": [
          {
            "group": "201",
            "optional": false,
            "field": "USER_UPDATED",
            "description": "<p>User was updated.</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "403": [
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_BANNED",
            "description": "<p>Your account was banned. (Reason included in body)</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_WRONG",
            "description": "<p>You are not allowed to perform this action.</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_NEEDED",
            "description": "<p>You are not allowed to perform this action.</p>"
          }
        ],
        "404": [
          {
            "group": "404",
            "optional": false,
            "field": "USER_NOT_FOUND",
            "description": "<p>There is no user with the id <code>userId</code></p>"
          }
        ],
        "406": [
          {
            "group": "406",
            "optional": false,
            "field": "USER_INGAMEID_WRONGFORMAT",
            "description": "<p>The ingame ID has the wrong format (P-000-000-000).</p>"
          },
          {
            "group": "406",
            "optional": false,
            "field": "USERNAME_INVALID",
            "description": "<p>Username is not valid!</p>"
          },
          {
            "group": "406",
            "optional": false,
            "field": "USER_DISCORD_INVALID",
            "description": "<p>Discord is not valid!</p>"
          }
        ],
        "409": [
          {
            "group": "409",
            "optional": false,
            "field": "USERNAME_EMAIL_CONFLICT",
            "description": "<p>Username is already in use.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/v1/users.js",
    "groupTitle": "Users"
  },
  {
    "type": "put",
    "url": "/users/:userId/avatar",
    "title": "Updates a Users avatar",
    "name": "UpdateUserAvatar",
    "group": "Users",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>JWT Token for authentication</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "userId",
            "description": "<p>The ID of the User</p>"
          },
          {
            "group": "Parameter",
            "type": "File",
            "optional": false,
            "field": "avatar",
            "description": "<p>multipart/form-data of a png or jpg file</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "201": [
          {
            "group": "201",
            "optional": false,
            "field": "USER_AVATAR_UPDATED",
            "description": "<p>Avatar was updated.</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "400": [
          {
            "group": "400",
            "optional": false,
            "field": "USER_AVATAR_WRONGFORMAT",
            "description": "<p>Your avatar is not a png or jpg file.</p>"
          }
        ],
        "403": [
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_BANNED",
            "description": "<p>Your account was banned. (Reason included in body)</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_WRONG",
            "description": "<p>You are not allowed to perform this action.</p>"
          },
          {
            "group": "403",
            "optional": false,
            "field": "AUTHENTICATION_NEEDED",
            "description": "<p>You are not allowed to perform this action.</p>"
          }
        ],
        "404": [
          {
            "group": "404",
            "optional": false,
            "field": "USER_NOT_FOUND",
            "description": "<p>There is no user with the id <code>userId</code></p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/v1/users.js",
    "groupTitle": "Users"
  }
] });
