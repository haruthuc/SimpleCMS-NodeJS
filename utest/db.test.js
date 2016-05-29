var assert = require('chai').assert;
var db = require('../helpers/db.js');
var chai = require('chai'), should = chai.should();
var crypto = require('crypto');
var uuid = require('node-uuid');

describe('SIMPLE CMS USER MODEL TEST', function(){
	var USERMODEL = new db.USERMODEL();
	var id = uuid.v4();
  it('add user error should be null', function(done){
    	USERMODEL.add({
    		id: id,
	        username : "admin",
	        password :  crypto.createHash('md5').update("admin").digest('hex'), //encode md5
	        fullname : "JohnDea",
	        email : "haruthu@gmail.com",
	        role : "ADMIN",
	        dateCreated : new Date()
	    },done);
  });

   it('update user error should be null', function(done){
    	USERMODEL.update({
    		id: id,
	        username : "user-test22"
	    },done);
  });

    it('find user error should be null', function(done){
    	USERMODEL.find({
    		id: id,
	        username : "user-test22"
	    },function(error,rows){
	    	console.log("users",rows);
	    	assert.isArray(rows);
	    	done();
	    });
    });

    it('delete user error should be null', function(done){
    	USERMODEL.delete(id+'11',done);
    });
});

describe('SIMPLE CMS MENU MODEL TEST', function(){
	var MENUMODEL = new db.MENUMODEL();
	var id = uuid.v4();
  it('add menu error should be null', function(done){
    	MENUMODEL.add({
			id:"m-"+id,
			title: "TEST MENU",
			link :"GOOGLE.COM",
			level:0,
			parentid:0,
			sortOrder: 0,
			position: "main"
    	},done);
  });

   it('update menu error should be null', function(done){
    	MENUMODEL.update({
    		id: "m-"+id,
	        title : "menu test title"
	    },done);
  });

    it('find menu error should be null', function(done){
    	MENUMODEL.find({
    		id:"m-"+id
	    },function(error,rows){
	    	console.log("users",rows);
	    	assert.isArray(rows);
	    	done();
	    });
    });

    // it('delete menu error should be null', function(done){
    // 	//MENUMODEL.delete(id+'11',done);
    // });
});


describe('SIMPLE CMS CONTENT MODEL TEST', function(){
	var MENUMODEL = new db.MENUMODEL();
	var id = uuid.v4();
  it('add content error should be null', function(done){
    	MENUMODEL.add({
			id:"m-"+id,
			title: "TEST MENU",
			link :"GOOGLE.COM",
			level:0,
			parentid:0,
			sortOrder: 0,
			position: "main"
    	},done);
  });

   it('update content error should be null', function(done){
    	MENUMODEL.update({
    		id: "m-"+id,
	        title : "menu test title"
	    },done);
  });

    it('find content error should be null', function(done){
    	MENUMODEL.find({
    		id:"m-"+id
	    },function(error,rows){
	    	console.log("users",rows);
	    	assert.isArray(rows);
	    	done();
	    });
    });

    it('delete menu error should be null', function(done){
    	MENUMODEL.delete(id+'11',done);
    });
});

