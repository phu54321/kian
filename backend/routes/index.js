var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({
    error: 0
  })
});

module.exports = router;
