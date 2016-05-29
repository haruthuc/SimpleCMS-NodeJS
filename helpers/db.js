var sqlite3 = require('sqlite3').verbose();

var dbConfig = require('../config').development.database;

var dbFile = dbConfig.connection.filename;
var fs = require('fs');
var _ = require('lodash');
var uuid = require('node-uuid');
var async =require('async');
//check exist file db
var exists = fs.existsSync(dbFile);
var db =null;
var crypto = require('crypto');
var PAGE_LIMIT = 10;

function initTable(){
	//init table user
	/*
    User: id, username, password, fullname, email, role, dateCreated, status

    Menu: id, title, link, level, parentid, order, positionBlock, status

    Content: id, title, picture, content, meta_head, meta-search-info, dateCreated, datePublish, tags, status
	*/

	//create table USER
	db.run("CREATE TABLE IF NOT EXISTS user (id TEXT,username TEXT, password TEXT, fullname TEXT, email TEXT, role TEXT,dateCreated NUMERIC, status INTEGER)");

	//create table MENU
	db.run("CREATE TABLE IF NOT EXISTS menu (id TEXT,title TEXT, link TEXT,level INTEGER, parentid INTEGER, sortOrder INTEGER, position TEXT, dateCreated NUMERIC, status INTEGER)");

	//create table content
	db.run("CREATE TABLE IF NOT EXISTS content(id TEXT,title TEXT, picture TEXT, content TEXT,meta_head TEXT,meta_search TEXT,dateCreated NUMERIC, datePublish NUMERIC, tags TEXT, status TEXT)")
	console.log("INIT TABLE");
};

function objectToParams(obj){

	if(typeof obj.dateCreated == "undefined"){
		obj.dateCreated = new Date();
	}

	if(typeof obj.status == "undefined")
		obj.status = 1; // STATUS == 1 NORMAL, 2 == DELETED 

	if(typeof obj.id == "undefined")
		obj.id = uuid.v4();



	obj = _.mapKeys(obj, function(value, key) {
	  return "$"+key;
	});
	return obj;
}

function objectToQueryString(obj,updateFlag){
	console.log("object to query ",obj);
	var obj = _.clone(obj);
	var queryString = '';
	if(typeof obj == "undefined" || obj == null){
		return queryString;
	}

	if( typeof obj.id != "undefined"
		 && updateFlag === true){
		delete obj.id;
	}

	if(typeof obj.limit != "undefined")
		delete obj.limit
	if(typeof obj.page != "undefined")
		delete obj.page;

	if(typeof obj.orderBy != "undefined")
		delete obj.orderBy
	if(typeof obj.order != "undefined")
		delete obj.order;

	var keys = _.keys(obj);
	for(var i = 0; i < keys.length; i++){
		var key = keys[i];
		var value = obj[key];
		if(typeof value =="string")
			value = '"'+value+'"';
		queryString += key+"="+value;
		if(i<keys.length-1){
			if(updateFlag)
				queryString+=', ';
			else
				queryString+=' AND ';
		}
	}
	return queryString;
}


function initDatabase(){
	//if dont exist will create file db
	if(!exists){
		console.log("Creating DB file.");
	 	fs.openSync(dbFile, "w");
	}

	db = new sqlite3.Database(dbFile);
	initTable();
}

// base add query
function addQuery(table,obj,cb){
	obj = objectToParams(obj);
	var keys = _.keys(obj);
	var query = "INSERT INTO "+table+" VALUES("+_.toString(keys)+")";
	console.log("add query "+table,query);
	console.log("add query obj "+table,obj);
	db.run(query,obj,function(error){
		if(error){
			console.error("ERROR: INSERT "+table,error);

		}
		cb(error);
	});
}

//base update query
function updateQuery(table,fields,cb){
	console.log("update "+table);
	if(!fields.id)
	{
		cb("NO EXIST ID WHEN UPDATE "+table);
		console.error("NO EXIST ID WHEN UPDATE "+table);
		return;
	}
	var id = fields['id'];
	var query = "UPDATE "+table+" SET "+objectToQueryString(fields,true);
	query +=" WHERE id='"+id+"'";
	db.run(query,function(error){
		if(error){
			console.error("ERROR UPDATE "+table,error,query);
		}
		cb(error);
	});

}

//base delete query
function deleteQuery(table,id,cb){
	var query = "DELETE FROM "+table+" WHERE id='"+id+"'";
	console.log("delete "+table+" query ",query);
	db.run(query,function(error){
		if(error){
			console.error("ERROR DELETE "+table,error,id);
		}
		cb(error);
	});

}

function findOne(table,$args,cb){
	if(typeof $args != "undefined"){
		var query = "SELECT * FROM "+table+" WHERE "+objectToQueryString($args,false);
		query += " LIMIT 1";
		console.log("find one"+table+" by args",query);
		db.all(query,function(err,rows){
			if(err){
				console.error("ERROR find one"+table,err);
			}
			console.log("find one",rows);

			cb(err,rows);

		});

	}else{
		cb("Invaild params",false);
	}

}


//base find query
function findQuery(table,$args,cb){
	if(typeof $args != "undefined"){
		var page = $args['page']?$args['page']:1;
		var limit =  $args['limit']?$args['limit']:PAGE_LIMIT;
		var order = $args['order']?$args['order']:"ASC";
		var orderBy = $args['orderBy']?$args['orderBy']:"dateCreated";
		//convert Object to Query String
		var queryParse = objectToQueryString($args,false);
		if(queryParse){
			var query = "SELECT * FROM "+table+" WHERE "+objectToQueryString($args,false);
		}
		else{
			var query = "SELECT * FROM "+table;
		}

		query += " ORDER BY "+orderBy+" "+order;

		query += " LIMIT "+limit+" OFFSET "+limit*(page-1);

		//count all

		//find data
		async.waterfall([
			function countQuery(callback){
				var queryCount = "SELECT count(*) as TOTALNUMBER FROM "+table;
				db.all(queryCount,function(err,rows){
					if(err){
						console.error("ERROR find "+table,err);
						callback(err);
					}else{
						callback(null,rows[0].TOTALNUMBER);
					}
				});
			},
			function findAll(total,callback){
				console.log("find all "+table+" by args",query);
				db.all(query,function(err,rows){
					if(err){
						console.error("ERROR find "+table,err);
						callback(err);
					}else{
						callback(null,total,rows);
					}

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
	    		console.log("Find all query error",err);
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
	db.close();
}


var BASEMODEL = function(tableName){

	if(db == null){
		initDatabase();
	}

	return {
		add : function add(obj,cb){
			console.log("insert "+tableName,obj);
			addQuery(tableName,obj,cb);

		},
		update : function update(fields,cb){
			console.log("update "+tableName);
			updateQuery(tableName,fields,cb);

		},
		delete : function deleteUser(id,cb){
			deleteQuery(tableName,id,cb);

		},
		find : function findByArgs($args,cb){
			findQuery(tableName,$args,cb);
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