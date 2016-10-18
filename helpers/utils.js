
var Promise = require('promise');
var db = require('./db.js');
var CONTENTMODEL = new db.CONTENTMODEL();
var MENUMODEL = new db.MENUMODEL();

module.exports.get_content_helper = function(key,projection,args,callback){
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

module.exports.get_menu_helper = function(key,projection,args,callback){
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
