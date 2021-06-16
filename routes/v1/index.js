const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/oauth', require('./oauth'));
router.use('/discovery', require('./discovery'));
router.use('/games', require('./games'));
router.use('/gameScreenshots', require('./gameScreenshots'));
router.use('/gameComments', require('./gameComments'));
router.use('/gameChannels', require('./gameChannels'));
router.use('/users', require('./users'));
router.use('/playlists', require('./playlists'));
router.use('/moderation', require('./moderation'));

module.exports = router;