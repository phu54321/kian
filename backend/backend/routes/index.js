const express = require('express');
const router = express.Router();

require('../models/note');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.json({
        error: 0
    });
});

module.exports = router;
