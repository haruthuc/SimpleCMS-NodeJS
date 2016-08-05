
var Promise = require('promise');
var db = require('./db.js');
var CONTENTMODEL = new db.CONTENTMODEL();
var MENUMODEL = new db.MENUMODEL();
var logger = require("./logger.js");

module.exports.get_content_helper = function(key,projection,args){
  return new Promise(function (fulfill, reject){
      CONTENTMODEL.find(projection,args,function(err,result){
          if (err) reject(err);
          else {
            result.key = key;
            fulfill(result);
          }
      });
  });
}

module.exports.get_menu_helper = get_menus;

function get_menus(key,projection,args){
  return new Promise(function (fulfill, reject){
      MENUMODEL.find(projection,args,function(err,result){
          if (err) reject(err);
          else {
            result.key = key;
            fulfill(result);
          }
      });
  });
}

function get_childrent_menu(menu_id,menu){
    

}

module.exports.get_multilevel_menu_helper = function(callback){
    get_menus("menu",'title,link,parentid',{orderBy:"sortOrder",order:"ASC",limit : "none"}).then(function(res){
        logger.info("get multilevel menus ",res);
        if(res.data && res.data.length > 0){
          var menus = _.filter(res.data, function(o) { return (o.parentid==0 || o.parentid == ""); });



        }
        callback();
    });
}
