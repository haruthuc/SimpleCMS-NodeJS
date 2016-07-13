var express = require('express');
var router = express.Router();
var template = require('../config').frontend.template || "default";
var title = require('../config').frontend.title || "";
/* GET home page. */
router.get('/login', function(req, res, next) {
  res.render('login', { title: 'SimpleCMS Login' });
});

router.get('/', function(req, res, next) {
  res.render('frontend/templates/'+template+'/index', { title: title ,template: template});
});


module.exports = router;
