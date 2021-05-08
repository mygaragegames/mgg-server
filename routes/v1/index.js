const express = require('express');
const router = express.Router();

router.use('/games', require('./games'));
router.use('/gameScreenshots', require('./gameScreenshots'));
router.use('/users', require('./users'));

module.exports = router;