var sqlite3 = require('sqlite3').verbose();
var dbConfig = require('../config').database;
var connectionString = dbConfig.connection;
var _ = require('lodash');
var uuid = require('node-uuid');
var async =require('async');

var _mdb =null;
var crypto = require('crypto');
var PAGE_LIMIT = 10;
var logger = require("./logger.js");

var MongoClient = require('mongodb').MongoClient;

function initDatabase(){
	//if dont exist will create file db
	logger.info("init database Connection String ",connectionString);
  if(!_mdb){
    var self = this;

    MongoClient.connect(connectionString, {}, function ( error, db ){
      if (error) {
        if (cb) {
            logger.error("cannot init mongo client ",error);
        } else {
          throw error;
        }

        return;
      }

      self._mdb = db;
    });


  }else{
    logger.info("Database")
  }
}

// base add query
function addQuery(table,obj,cb){

  var collection = this._mdb.collection(table);
  logger.info("Begin insert data ",obj);
  obj.dateCreated = new Date();
  collection.insertOne(obj,function(error,r){
    if(error){
      logger.error("Cannot insert data " + table,error);
      cb("CANNOT INSERT DATA - COLLECTION ",table);
      return;
    }
      logger.info("Insert data successfully " + table,obj);
      cb(null);
  });
}

//base update query
function updateQuery(table,fields,cb){
	logger.info("update "+table);
	if(!fields.id)
	{
		cb("NO EXIST ID WHEN UPDATE "+table);
		logger.error("NO EXIST ID WHEN UPDATE "+table);
		return;
	}
	var id = _.clone(fields['id']);
  var collection = this._mdb.collection(table);
  delete fields['id'];
  collection.updateOne({"_id":new ObjectId(id)} , {'$set' : fields},{
          upsert: true
        },
  function(error,r){
    if(error){
      logger.error("Cannot insert data " + table,error);
      cb("CANNOT UPDATE DATA - COLLECTION ",table);
      return;
    }
      logger.info("UPDATE DATA SUCCESSFULLY " + table,obj);
      cb(null);
  });

}

//base delete query
function deleteQuery(table,id,cb){

  var collection = this._mdb.collection(table);
  collection.deleteOne({"_id":new ObjectId(id)} ,
      function(error,r){
        if(error){
          logger.error("Cannot insert data " + table ,error);
          cb("CANNOT UPDATE DATA - COLLECTION "+table);
          return;
        }
          logger.info("UPDATE DATA SUCCESSFULLY " + table,obj);
          cb(null);
      }
  );

}

function findOne(table,$args,cb){
	if(typeof $args != "undefined"){
		  var collection = this._mdb.collection(table);
      collection.find($args).limit(1).toArray(function(err, docs) {
          if(err){
            callback("CANNOT FIND COLLECTION " + table, err);
            return;
          }
          if(docs.length > 0){
            callback(null,docs[0]);
            return;
          }
          callback(null,docs);
      });
    });

	}else{
		cb("Invaild params",false);
	}

}

//base find query
function findQuery(table,$projection,$args,cb){
	if(typeof $args != "undefined"){
		var queryObject = _.clone($arg);
		var hasArgs = (arrayKeys.length>0)?true:false;
		var page = $args['page']?$args['page']:0;
		var limit =  $args['limit']?$args['limit']:PAGE_LIMIT;
		var order = $args['order']?$args['order']:"DESC";
		var orderBy = $args['orderBy']?$args['orderBy']:"dateCreated";
		var projection = ($projection)?$projection:{};
    var skip = page*limit;
		//count all
    var collection = this._mdb.collection(table);
    var sortObject = {};
    sortObject[orderBy] = order;
    delete $args['limit'];
    delete $args['page'];
    delete $args['order'];
    delete $args['orderBy'];
		//find data
		async.waterfall([
			function countQuery(callback){
        collection.find(queryObject).count(function(error,total){
          if(error){
            logger.error("CANNOT COUNT TOTAL " + table);
            callback(error);
            return;
          }
            callback(null,total);
        });
			},
			function findAll(total,callback){
				logger.info("find all "+table+" by args",queryObject);
        collection.find(queryObject).limit(limit)
        .skip(skip).project(projection)
        .sort(sortObject).toArray(function(err,docs){
            if(err){
              logger.error("CANNOT FIND ALL ERROR",err);
              callback("CANNOT FIND ALL ",+table);
              return;
            }
            callback(null,docs);
            return;
        });
			},
			function returnData(total,data,callback){
				callback(null,{
					success:true,
					total: total,
					data: data,
					page: page,
					limit: limit,
					sortby: orderBy,
					sort: order
				});
			}
		],function (err, result) {
	    // result now equals 'done'
	    	if(err){
	    		logger.info("Find all query error",err);
	    		cb({
	    			success:false,
	    			error: JSON.stringify(err)
	    		});
	    	}else{
	    		cb(null,result);
	    	}
		});

	}
	else{
		// var query = "SELECT * FROM "+table;
		cb({
			success:false,
			error: "Invalid params"
		});
	}

}


function close(){
	_mdb.close();
}


var BASEMODEL = function(tableName){

	if(_mdb == null){
		initDatabase();
	}

	return {
		add : function add(obj,cb){
			logger.info("insert "+tableName,obj);
			addQuery(tableName,obj,cb);

		},
		update : function update(fields,cb){
			logger.info("update "+tableName);
			updateQuery(tableName,fields,cb);

		},
		delete : function deleteUser(id,cb){
			deleteQuery(tableName,id,cb);

		},
		find : function findByArgs(projection,$args,cb){
			findQuery(tableName,projection,$args,cb);
		},
		findOne : function findOneByArgs($args,cb){
			findOne(tableName,$args,cb);
		}
	}
};
//user model
exports.USERMODEL = function(){
	return new BASEMODEL('user');
};

//menu model
exports.MENUMODEL = function(){
	return new BASEMODEL('menu');

}

//content model
exports.CONTENTMODEL = function(){
	return new BASEMODEL("content");
}

//tags model
exports.TAGMODEL = function(){
	return new BASEMODEL("tag");
}

//tags model
exports.PICTURE = function(){
	return new BASEMODEL("picture");
}
exports.init = initDatabase;
exports.close = close;

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/admin');
}

exports.isLoggedIn = isLoggedIn;
exports.PAGE_LIMIT = PAGE_LIMIT;

function randomValueBase64 (len) {
    return crypto.randomBytes(Math.ceil(len * 3 / 4))
        .toString('base64')   // convert to base64 format
        .slice(0, len)        // return required number of characters
        .replace(/\+/g, '0')  // replace '+' with '0'
        .replace(/\//g, '0'); // replace '/' with '0'
}


function makeAliasLink(str){
		var re = /(?![\x00-\x7F]|[\xC0-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}|[\xF0-\xF7][\x80-\xBF]{3})./g;
		ret = str.replace(re,"");
	 	ret = ret.replace(/ /g,"-"); // replace spaces
		// do other replacements that make sense in your case, e.g.:
		ret = ret.replace(/&/g,"and");
		ret+="-"+randomValueBase64(2);

		return ret.toLowerCase();
}

exports.makeAliasLink = makeAliasLink;
exports.randomValueBase64 = randomValueBase64;
