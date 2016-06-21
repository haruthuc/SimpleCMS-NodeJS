var express = require('express');
var router = express.Router();
var db = require('../helpers/db.js');
var MENUMODEL = new db.MENUMODEL();
var TAGMODEL = new db.TAGMODEL();
var _ = require('lodash');
var async =require('async');

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

	router.get('/newpage', db.isLoggedIn, function(req, res, next) {
	  res.render('admin/newpage', { title: 'Simple CMS - Add new page',active:"newpage"});
	});

	router.get('/settings', db.isLoggedIn, function(req, res, next) {
	  res.render('admin/settings', { title: 'Simple CMS',active:"settings"});
	});

	router.post('/',
	  passport.authenticate('local', { successRedirect: '/admin/dashboard',
	                                   failureRedirect: '/admin',
	                                   failureFlash: true }
	   )
	);

	//update menus
	router.put("/api/menu",db.isLoggedIn,function(req,res,next){

		if(req.body.data){
			console.log("update menus",req.body.data);
			var data = JSON.parse(req.body.data);
			async.map(data, MENUMODEL.update, function(err, results){
			    // results is now an array of stats for each file
			    if(err){
			    	console.log('update menu error ',err);
			    	res.json({
			    		success:false,
			    		message: JSON.stringify(err)
			    	})
			    }else{

			    	res.json({
			    		success:true,
			    		message: "Update successfully"
			    	});
			    }
			});

		}else{
			console.log("update menu invalid data");
			res.json({
	    		success:false,
	    		message: "Invalid data"
	    	});
		}
	});


	//add new menu
	router.post("/api/menu",db.isLoggedIn,function(req,res,next){
		if(req.body){
			if(req.body.title!=''&&req.body.link!=''){
				MENUMODEL.add(req.body,function(error){
					if(error){
						res.json({
							success:false,
							message:"Can not addd menu"
						});
						console.log("ERROR add menu api ",error);
					}else{
						res.json({
							success:true,
							message:"Add menu successfully"
						});
					}

				});

			}
		}else{
			res.json({
				success:false,
				message: "Invalid post data"
			})
		}
	});

	//delte menu
	router.delete("/api/menu",db.isLoggedIn,function(req,res,next){
		var id = req.body.id || '';
		if(id!=''){
			MENUMODEL.delete(id,function(error){
				if(error){
					res.json({
						success:false,
						message:"Can not delete menu"
					});
					console.log("ERROR delete menu api ",error);
				}else{
					res.json({
						success:true,
						message:"Delete menu successfully"
					});
				}

			});

		}else{
			res.json({
				success:false,
				message:"Can not delete menu"
			});
		}
	});

	//get list menu
	router.get("/api/menu",db.isLoggedIn,function(req,res,next){
		var args = {};
		console.log("request query",req.query);

		MENUMODEL.find("id,title,link",req.query,function(error,returnData){
	    	console.log("MENU ",returnData);
	    	if(!error){
	    		res.json(returnData);
	    	}
	    	else {
	    		console.log("ERROR get api/menu",error);
	    		res.json({
	    			success :false,
	    			error : "Can not get menus"
	    		})
	    	}

	    });
	});

	router.get("/api/tag",db.isLoggedIn,function(req,res,next){
		var args = {};
		console.log("request query",req.query);

		TAGMODEL.find("title",{},function(error,returnData){
	    	console.log("TAGS ",returnData);
	    	if(!error){
	    		res.json(returnData);
	    	}
	    	else {
	    		console.log("ERROR get api/tag",error);
	    		res.json({
	    			success :false,
	    			error : "Can not get tags"
	    		})
	    	}

	    });
	});

	//add tags
	//add new menu
	router.post("/api/tag",db.isLoggedIn,function(req,res,next){
		if(req.body){
			if(req.body.title!=''){
				TAGMODEL.add(req.body,function(error){
					if(error){
						res.json({
							success:false,
							message:"Can not add tag"
						});
						console.log("ERROR add tag api ",error);
					}else{
						res.json({
							success:true,
							message:"Add tag successfully"
						});
					}

				});

			}
		}else{
			res.json({
				success:false,
				message: "Invalid post data"
			})
		}
	});

	router.delete("/api/tag",db.isLoggedIn,function(req,res,next){
		var id = req.body.id || '';
		if(id!=''){
			TAGMODEL.delete(id,function(error){
				if(error){
					res.json({
						success:false,
						message:"Can not delete tag"
					});
					console.log("ERROR delete tag api ",error);
				}else{
					res.json({
						success:true,
						message:"Delete tag successfully"
					});
				}

			});
		}else{
			res.json({
				success:false,
				message:"Can not delete tag"
			});
		}
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
