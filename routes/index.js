var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  req.session.lastPage = '/awesome' + req;
  console.log(req.session);
  res.render('index', { title: 'Sukelluspojat' });
});

module.exports = router;
