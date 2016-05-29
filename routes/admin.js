var express = require('express');
var router = express.Router();
var db = require('../helpers/db.js');
var MENUMODEL = new db.MENUMODEL();
var _ = require('lodash');

module.exports = function(passport){
	router.get('/', function(req, res, next) {
	  res.render('login', { title: 'Simple CMS' });
	});

	router.get('/dashboard', db.isLoggedIn, function(req, res, next) {
	  res.render('admin/index', { title: 'Simple CMS',active:"dashboard"});
	});

	router.get('/menu', db.isLoggedIn, function(req, res, next) {
	  res.render('admin/menu', { title: 'Simple CMS',active:"menu"});
	});

	router.get('/page', db.isLoggedIn, function(req, res, next) {
	  res.render('admin/page', { title: 'Simple CMS',active:"page"});
	});

	router.get('/profile', db.isLoggedIn, function(req, res, next) {
	  res.render('admin/profile', { title: 'Simple CMS',active:"profile"});
	});


	router.post('/',
	  passport.authenticate('local', { successRedirect: '/admin/dashboard',
	                                   failureRedirect: '/admin',
	                                   failureFlash: true }
	   )
	);


	//add new menu
	router.post("/api/menu",db.isLoggedIn,function(req,res,next){
		


	});

	//get list menu
	router.get("/api/menu",db.isLoggedIn,function(req,res,next){
		var args = {};
		console.log("request query",req.query);
		
		MENUMODEL.find(req.query,function(error,returnData){
	    	console.log("MENU ",returnData);
	    	if(!error){
	    		res.json(returnData);
	    	}
	    	else {
	    		console.log("ERROR api/menu",error);
	    		res.json({
	    			succuess :false,
	    			error : "Can not get menus"
	    		})
	    	}

	    });	
	});


	// =====================================
    // LOGOUT ==============================
    // =====================================
    router.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/admin');
    });

	return router;
};
