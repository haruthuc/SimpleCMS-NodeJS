var express = require('express');
var router = express.Router();
var template = require('../config').frontend.template || "default";
var title = require('../config').frontend.title || "";
var _utils = require('../helpers/utils.js');
var _ = require('lodash');
/* GET home page. */
router.get('/login', function(req, res, next) {
  res.render('login', { title: 'SimpleCMS Login' });
});

router.get('/', function(req, res, next) {
  //menus
  //topbanner
  //top of category
  Promise.all([
    _utils.get_menu_helper("menu",'title,link',{orderBy:"sortOrder",order:"ASC",limit : "none"}),
    _utils.get_content_helper("apartforent",'id,title,picture,price',{})
  ]).then(function(values){
    var data = {};
    if(values.length > 0){
        data = _.keyBy(values, 'key');

        data = _.mapValues(data, function(o) { return o.data; });
    }

    var returnObject = { title: title ,template: template};
    returnObject = _.assign(returnObject,data);
    console.log("return object ",returnObject);
    res.render('frontend/templates/'+template+'/index',returnObject);

  });

});


module.exports = router;
