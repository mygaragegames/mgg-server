const path = require('path');

function parseAvatar(avatarFileName) {
    if(avatarFileName) {
        return path.join(process.env.ASSET_BASE, "avatars", avatarFileName);
    } else {
        return path.join(process.env.ASSET_BASE, "defaultAvatar.png");
    }
}

module.exports = {
    parseAvatar
}