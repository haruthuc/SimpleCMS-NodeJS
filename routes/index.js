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
    _utils.get_content_helper("banners",'id,alias,title,picture',{tags:"%main-banner%"}),
    _utils.get_content_helper("hotproperty",'id,alias,title,picture,price',{tags:"%HOTPROPERTY%"}),
    _utils.get_content_helper("apartforent",'id,alias,title,picture,price',{tags:"%apartforrent%"}),
    _utils.get_content_helper("apartfosale",'id,alias,title,picture,price',{tags:"%apartforsale%"}),
    _utils.get_content_helper("houseforsaleandrent",'id,alias,title,picture,price',{tags:"%houseforsalerent%"})
  ]).then(function(values){
    var data = {};
    if(values.length > 0){
        data = _.keyBy(values, 'key');

        data = _.mapValues(data, function(o) { return o.data; });
    }

    var returnObject = { title: title ,template: template};
    returnObject = _.assign(returnObject,data);
    console.log("return object ",returnObject);
    returnObject.selected = "Main";
    res.render('frontend/templates/'+template+'/index',returnObject);

  });

});

router.get("/content/:alias", function(req, res, next){
  	var alias = req.params.alias;
    if(alias){
      Promise.all([
        _utils.get_menu_helper("menu",'title,link',{orderBy:"sortOrder",order:"ASC",limit : "none"}),
        _utils.get_content_helper("content",'',{alias:"%"+alias+"%"}),
        _utils.get_content_helper("hotproperty",'id,alias,title,picture,price',{tags:"%HOTPROPERTY%"})
      ]).then(function(values){
        var data = {};
        if(values.length > 0){
            data = _.keyBy(values, 'key');
            data = _.mapValues(data, function(o) { return o.data; });
        }

        var returnObject = { title: title ,template: template};
        returnObject = _.assign(returnObject,data);
        console.log("return object alias query page",returnObject);
        if(returnObject.content && returnObject.content.length > 0){
          returnObject.content = returnObject.content[0];
          res.render('frontend/templates/'+template+'/content',returnObject);
        }else{
          res.render('frontend/pagenotfound');
        }

      }
    );
    }else{
      res.render('frontend/pagenotfound');
    }
});


router.get("/tags/:tag", function(req, res, next){
  	var tag = req.params.tag;
    if(tag){
      var contentQuery ={tags:"%"+tag+"%"};
      if(req.query.page)
          contentQuery.page = req.query.page;
      Promise.all([
        _utils.get_menu_helper("menu",'title,link',{orderBy:"sortOrder",order:"ASC",limit : "none"}),
        _utils.get_content_helper("content",'',contentQuery)
      ]).then(function(values){
        var data = {};
        if(values.length > 0){
            data = _.keyBy(values, 'key');
            //data = _.mapValues(data, function(o) { return o.data; });
        }

        if(data.menu){
          data.menu = _.result(data.menu,"data");
        }

        var returnObject = { title: title ,template: template};

        var selectedMenu = _.find(data.menu, { 'link':"tags/"+tag});
        if(selectedMenu){
          returnObject.selected =  selectedMenu['title'];
        }
        returnObject.selectedTag = tag;
        returnObject = _.assign(returnObject,data);
        console.log("return object alias query page",returnObject);

        res.render('frontend/templates/'+template+'/tags',returnObject);

      }
    );
    }else{
      res.render('frontend/pagenotfound');
    }
});

module.exports = router;
