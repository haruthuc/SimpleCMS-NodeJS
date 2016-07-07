var sqlite3 = require('sqlite3').verbose();

var dbConfig = require('../config').database;

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

var MenuSchema = {
	id : {
		type : "TEXT",
		default : function(){
			return uuid.v4();
		}
		//required : true
	},
	title:{
		type:"TEXT"
	},
	link : {
		type:"TEXT"
	},
	level : {
		type:"INTEGER",
		default:0
	},
	parentid:{
		type:"TEXT",
		default:""
	},
	sortOrder :{
		type:"INTEGER"
	},
	position: {
		type:"TEXT"
	},
	dateCreated: {
		type:"NUMERIC",
		default: function (){
			return new Date();
		}
	},
	status:{
		type:"INTEGER",
		default:1
	}
};

var UserSchema = {
	"id": {
		type:"TEXT",
		default: function(){
			return uuid.v4();
		}
	},
	"username": "TEXT",
	"password": "TEXT",
	"fullname": "TEXT",
	"email": "TEXT",
	"role" :"TEXT",
	"dateCreated":{
		type:"NUMERIC",
		default: function () {
			return new Date();
		}
	},
	"status":{
		type:"INTEGER",
		default:1
	}
};
var ContentSchema = {
	id:{
		type:"TEXT",
		default: function() {
			return uuid.v4();
		}
	},
	title:"TEXT",
	picture:"TEXT",
	content:"TEXT",
	meta_head:"TEXT",
	meta_search:"TEXT",
	tags:"TEXT",
	datePublish: {
		type:"NUMERIC",
		default: function () {
			return new Date();
		}
	},
	dateCreated:{
		type:"NUMERIC",
		default: function(){
			return new Date();
		}
	},
	status:{
		type:"INTEGER"
	}
};

//tags menu
var TagsSchema = {
	id:{
		type:"TEXT",
		default: function() {
			return uuid.v4();
		}
	},
	title:"TEXT",
	dateCreated:{
		type:"NUMERIC",
		default: function(){
			return new Date();
		}
	}
};


//picture
var PictureSchema = {
	id:{
		type:"TEXT",
		default: function() {
			return uuid.v4();
		}
	},
	contentID : "TEXT",
	title:"TEXT",
	description:"TEXT",
	url:"TEXT",
	dateCreated:{
		type:"NUMERIC",
		default: function(){
			return new Date();
		}
	}
};

//picture


var dbSchema = {
	menu : MenuSchema,
	user : UserSchema,
	content : ContentSchema,
	tag : TagsSchema,
	picture : PictureSchema
};


function initTable(){
	//init table user
	/*
    User: id, username, password, fullname, email, role, dateCreated, status

    Menu: id, title, link, level, parentid, order, positionBlock, status

    Content: id, title, picture, content, meta_head, meta-search-info, dateCreated, datePublish, tags, status
	*/

	//create table USER
	//db.run("CREATE TABLE IF NOT EXISTS user (id TEXT,username TEXT, password TEXT, fullname TEXT, email TEXT, role TEXT,dateCreated NUMERIC, status INTEGER)");
	db.run("CREATE TABLE IF NOT EXISTS user ("+schemaToColumnString(UserSchema)+")");

	//create table MENU
	db.run("CREATE TABLE IF NOT EXISTS menu ("+schemaToColumnString(MenuSchema)+")");

	//create table content
	db.run("CREATE TABLE IF NOT EXISTS content("+schemaToColumnString(ContentSchema)+")");

	//create table tags
	db.run("CREATE TABLE IF NOT EXISTS tag("+schemaToColumnString(TagsSchema)+")");

	//create table picture
	db.run("CREATE TABLE IF NOT EXISTS picture("+schemaToColumnString(PictureSchema)+")");

	console.log("INIT TABLE");
};

function schemaToColumnString(objSchema){
	//_.zipObjectDeep(['a.b[0].c', 'a.b[1].d'], [1, 2]);
	//create obj with {key:fieldtype}
	var objBuff = _.mapValues(objSchema, function(o) {
		 if(_.isObject(o) && o.type != undefined){
		 	return o.type || "TEXT";
		 }else{
		 	return o;
		 }
	});
	var keys = _.keys(objBuff);
	var strColumn = '';
	for(var i = 0; i < keys.length; i++){
		strColumn+=keys[i]+" "+objBuff[keys[i]];
		if(i<keys.length-1)
			strColumn+=', ';

	}
	return strColumn;
}

function objectToParams(obj,table){

	if(dbSchema[table] != undefined) {

		var schemaObj = dbSchema[table];

		schemaObj = _.mapValues(schemaObj, function(o) {
			 if(!_.isUndefined(o.default) && _.isFunction(o.default))
			 {
			 	return o.default();
			 }
			 return _.result(o,"default",'');
		});

		console.log("objectToParams schema object ",schemaObj);

		var defaultObject = _.defaults(obj,schemaObj);

		console.log("objectToParams default object ",defaultObject);

		defaultObject = _.pick(defaultObject,_.keys(schemaObj));

		console.log("objectToParams finished object ",defaultObject);

		defaultObject = _.mapKeys(defaultObject, function(value, key) {
		  return "$"+key;
		});

		return defaultObject;
	}else{
		return {};
	}
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
		if(value.indexOf("%")==1 || value.indexOf("_")==1){
				queryString += key+" LIKE "+value;
		}else{
				queryString += key+"="+value;
		}

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

	obj = objectToParams(obj,table);
	var id = obj["$id"];
	var keys = _.keys(obj);
	var query = "INSERT INTO "+table+" VALUES("+_.toString(keys)+")";
	console.log("add query "+table,query);
	console.log("add query obj "+table,obj);
	db.run(query,obj,function(error){
		if(error){
			console.error("ERROR: INSERT "+table,error);
			cb(error);
		}else{
			console.log("Add return id",id);
			cb(null,id);
		}

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
			if(rows.length >0 )
				cb(err,rows[0]);
			else
				cb(err,null);

		});

	}else{
		cb("Invaild params",false);
	}

}


//base find query
function findQuery(table,$projection,$args,cb){
	if(typeof $args != "undefined"){
		var arrayKeys = _.without(_.keys($args),"page","limit","order","orderBy");
		var hasArgs = (arrayKeys.length>0)?true:false;
		var page = $args['page']?$args['page']:1;
		var limit =  $args['limit']?$args['limit']:PAGE_LIMIT;
		var order = $args['order']?$args['order']:"DESC";
		var orderBy = $args['orderBy']?$args['orderBy']:"dateCreated";
		//convert Object to Query String
		var queryParse = objectToQueryString($args,false);
		var projection = ($projection)?$projection:"*";

		if(queryParse){
			var query = "SELECT "+projection+" FROM "+table+" WHERE "+objectToQueryString($args,false);
		}
		else{
			var query = "SELECT "+projection+" FROM "+table;
		}

		query += " ORDER BY "+orderBy+" "+order;
		if(limit!="none")
			query += " LIMIT "+limit+" OFFSET "+limit*(page-1);

		//count all

		//find data
		async.waterfall([
			function countQuery(callback){
				var queryCount = "SELECT count(id) as TOTALNUMBER FROM "+table;
				if(hasArgs)
					queryCount += " WHERE "+objectToQueryString($args,false);

				console.log("query count total number "+table+" by args",queryCount);
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
