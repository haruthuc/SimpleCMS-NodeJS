var express = require('express');
var router = express.Router();
var db = require('../helpers/db.js');
//init models
var MENUMODEL = new db.MENUMODEL();
var TAGMODEL = new db.TAGMODEL();
var CONTENTMODEL = new db.CONTENTMODEL();
var USERMODEL = new db.USERMODEL();
var MENULISTMODEL = new db.MENULISTMODEL();

var _ = require('lodash');
var async =require('async');
var crypto = require('crypto');
var sanitizeHtml = require('sanitize-html');
var mailer = require('../helpers/mailer.js');
var logger = require("../helpers/logger.js");
var allowClean = {
	allowedTags: [ 'b', 'i', 'em', 'strong', 'a', 'img','iframe' ],
	allowedAttributes: {
	  'a': [ 'href' ],
	  'img' : ['src','title','atl','style']
	},
	allowedIframeHostnames: ['www.youtube.com']
};

module.exports = function(passport){

	router.get('/forgotpassword', function(req, res, next) {
	  res.render('admin/forgotpassword', { title: 'Simple CMS - Request new password' });
	});


	router.post('/forgotpassword', function(req, res, next) {
		//TODO update forgotpassword improve security
		if(req.body.email){
			var email = req.body.email;
			USERMODEL.findOne({email:email},function(error,user){
				if(user){
					var newpassword = db.randomValueBase64(6);
					newpassword = newpassword.toLowerCase();
					user.password = crypto.createHash('md5').update(newpassword).digest('hex');
					//update new password
					USERMODEL.update(user,function(err){
						if(!err){
							mailer.sendAsync(email,"Reset password","Your new password is <b>"+newpassword+"</b> .");
							res.render('admin/forgotpassword', { title: 'Simple CMS' , res : {success : true} });
						}else{
							res.render('admin/forgotpassword', { title: 'Simple CMS - Request new password' });
						}
					});

				}else{
					res.render('admin/forgotpassword', { title: 'Simple CMS - Request new password' });
				}
			});

		}
	});


	router.get('/', function(req, res, next) {
	  res.render('login', { title: 'Simple CMS' });
	});

	router.get('/dashboard', db.isLoggedIn, function(req, res, next) {
	  res.render('admin/index', { title: 'Simple CMS',active:"dashboard"});
	});

	router.get('/menu', db.isLoggedIn, function(req, res, next) {
	  res.render('admin/menu', { title: 'Simple CMS',active:"menu"});
	});

	router.get('/menulist', db.isLoggedIn, function(req, res, next) {
		res.render('admin/menulist', { title: 'Simple CMS', active:"menulist"});
	});

	router.get('/newmenulist', db.isLoggedIn, function(req, res, next) {
		res.render('admin/newmenulist', { title: 'Simple CMS', active:"newmenulist"});
	});

	router.get('/newmenulist/:id', db.isLoggedIn, function(req, res, next) {
		var menuID = req.params.id;
		MENULISTMODEL.findOne({"id":menuID},function(error,content){
			if(error){
				logger.info("ERROR get one page by content id",menuID);
				res.redirect("/admin/newmenulist");
			}else{
				if(content){
					content.active = "newmenulist";
					res.render('admin/newmenulist',content);
				}else{
					res.redirect("/newmenulist");
				}
			}
		});

	});

	router.get('/page', db.isLoggedIn, function(req, res, next) {
	  res.render('admin/page', { title: 'Simple CMS',active:"page"});
	});

	router.get('/profile', db.isLoggedIn, function(req, res, next) {
		logger.info("session",req.session);
		if(req.session.passport && req.session.passport.user){
			USERMODEL.findOne({"id":req.session.passport.user}, function(err, user) {
		  	res.render('admin/profile', { title: 'Simple CMS',active:"profile", profile:user});
		  });

		}else{
			res.redirect("/");
		}

	});

	router.get('/newpage', db.isLoggedIn, function(req, res, next) {
	  res.render('admin/newpage', { title: '',active:"newpage"});
	});

	router.get('/newpage/:contentID', db.isLoggedIn, function(req, res, next) {
		var contentID = req.params.contentID;
		CONTENTMODEL.findOne({"id":contentID},function(error,content){
			if(error){
				logger.info("ERROR get one page by content id",contentID);
				res.redirect("/admin/newpage");
			}else{
				if(content){
					content.active = "newpage";
					res.render('admin/newpage',content);
				}else{
					res.redirect("/newpage");
				}
			}
		});

	});

	router.get('/settings', db.isLoggedIn, function(req, res, next) {
	  res.render('admin/settings', { title: 'Simple CMS',active:"settings"});
	});


	router.get('/tag', db.isLoggedIn, function(req, res, next) {
		res.render('admin/tag', { title: 'Simple CMS',active:"tag"});
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
			logger.info("update menus",req.body.data);
			var data = JSON.parse(req.body.data);
			async.map(data, MENUMODEL.update, function(err, results){
			    // results is now an array of stats for each file
			    if(err){
			    	logger.info('update menu error ',err);
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
			logger.info("update menu invalid data");
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
				MENUMODEL.add(req.body,function(error,id){
					if(error){
						res.json({
							success:false,
							message:"Can not addd menu"
						});
						logger.info("ERROR add menu api ",error);
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
					logger.info("ERROR delete menu api ",error);
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
		logger.info("request query",req.query);

		MENUMODEL.find("id,title,link",req.query,function(error,returnData){
	    	logger.info("MENU ",returnData);
	    	if(!error){
	    		res.json(returnData);
	    	}
	    	else {
	    		logger.info("ERROR get api/menu",error);
	    		res.json({
	    			success :false,
	    			error : "Can not get menus"
	    		})
	    	}

	    });
	});

//begin tag api
	router.get("/api/tag",db.isLoggedIn,function(req,res,next){
		var args = {};
		logger.info("request query",req.query);

		TAGMODEL.find("title,id",{},function(error,returnData){
	    	logger.info("TAGS ",returnData);
	    	if(!error){
	    		res.json(returnData);
	    	}
	    	else {
	    		logger.info("ERROR get api/tag",error);
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
				TAGMODEL.add(req.body,function(error,id){
					if(error){
						res.json({
							success:false,
							message:"Can not add tag"
						});
						logger.info("ERROR add tag api ",error);
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
					logger.info("ERROR delete tag api ",error);
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

	//end tag api

	//Begin content api
	router.post("/api/content",db.isLoggedIn,function(req,res,next){
		if(req.body){
			if(req.body.title!=''){
				req.body.alias = db.makeAliasLink(req.body.title);

				if(req.body.content){
						var clean = sanitizeHtml(req.body.content, allowClean);
						req.body.content = clean;
				}

				CONTENTMODEL.add(req.body,function(error,id){
					if(error){
						res.json({
							success:false,
							message:"Can not content tag"
						});
						logger.info("ERROR add content api ",error);
					}else{
						res.json({
							success:true,
							id : id,
							message:"Add content successfully"
						});
					}

				});
			}
		}else{
			res.json({
				success:false,
				message: "Invalid post data"
			});
		}
	});

	//Update content
	//update menus
	router.put("/api/content",db.isLoggedIn,function(req,res,next){
		if(req.body){
			logger.info("update content",req.body);
			if(req.body.title)
				req.body.alias = db.makeAliasLink(req.body.title);
			if(req.body.content){
					var clean = sanitizeHtml(req.body.content, allowClean);
					req.body.content = clean;
			}
			//var data = JSON.parse(req.body);
			CONTENTMODEL.update(req.body,function(err){
					// results is now an array of stats for each file
					if(err){
						logger.info('update content error ',err);
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
			logger.info("update content invalid data");
			res.json({
					success:false,
					message: "Invalid data"
				});
		}
	});

	//update profile
	router.put("/api/profile",db.isLoggedIn,function(req,res,next){
		if(req.body){
			logger.info("update profile",req.body);
			//var data = JSON.parse(req.body);
			if(req.body.username)
				delete req.body.username;

				//check valid password
				async.waterfall([
					function passwordCheck(callback){
						var profile = req.body;
						if(profile.email){
							var emailRegrex = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;

							if(!emailRegrex.test(profile.email)){
								callback("Your email invalid");
								return;
							}
						}

						if(!profile.password && !profile.newpassword){
							callback(null,profile);

						}else{
							//find one user compare hash password
							USERMODEL.findOne({"id":req.session.passport.user}, function(err, user) {
									var hashPassword = crypto.createHash('md5').update(profile.password).digest('hex');
									if(hashPassword!=user['password']){
										callback("Current password incorrect");
										return;
									}
									profile.password = crypto.createHash('md5').update(profile.newpassword).digest('hex');
									delete profile.newpassword;
									callback(null,profile);

							});

						}

					},
					function updateProfile(profile,callback){

						USERMODEL.update(profile,function(err){
								// results is now an array of stats for each file
								if(err){
									logger.info('update content error ',err);
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

					}
				],function (err, result) {

						if(err){
							logger.info("update password error",err);
							res.json({
								success:false,
								message: JSON.stringify(err)
							});
						}else{
							res.json({
								success:true,
								message:"Update profile successfully"
							});
						}
				});

		}else{
			logger.info("update content invalid data");
			res.json({
					success:false,
					message: "Invalid data"
				});
		}
	});


	//get list menu
	router.get("/api/content",db.isLoggedIn,function(req,res,next){
		var args = {};
		logger.info("request query",req.query);

		CONTENTMODEL.find("id,title,tags, alias, picture, dateCreated, datePublish",req.query,function(error,returnData){
				logger.info("PAGE ",returnData);
				if(!error){
					res.json(returnData);
				}
				else {
					logger.info("ERROR get api/content",error);
					res.json({
						success :false,
						error : "Can not get contents"
					})
				}

			});
	});

	router.delete("/api/content",db.isLoggedIn,function(req,res,next){
		var id = req.body.id || '';
		if(id!=''){
			CONTENTMODEL.delete(id,function(error){
				if(error){
					res.json({
						success:false,
						message:"Can not delete content"
					});
					logger.info("ERROR delete content api ",error);
				}else{
					res.json({
						success:true,
						message:"Delete content successfully"
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


	//MENU LIST
	router.put("/api/menulist",db.isLoggedIn,function(req,res,next){
		console.log("update menulist body menuid ",req.body.id);
		if(req.body.id){
			console.log("update menulist body data ",req.body);
			MENULISTMODEL.update(req.body, function(err){
			    if(err){
			    	logger.info('update menulist error ',err);
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
			logger.info("update menulist invalid data");
			res.json({
	    		success:false,
	    		message: "Invalid data"
	    	});
		}
	});


	//add new menu
	router.post("/api/menulist",db.isLoggedIn,function(req,res,next){
		if(req.body){
			if(req.body.menuid!=''&&req.body.menulist!=''){
			
				MENULISTMODEL.add(req.body,function(error,id){
					if(error){
						res.json({
							success:false,
							message:"Can not addd menulist"
						});
						logger.info("ERROR add menu api ",error);
					}else{
						res.json({
							success:true,
							message:"Add menulist successfully"
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
	router.delete("/api/menulist",db.isLoggedIn,function(req,res,next){
		var id = req.body.id || '';
		if(id!=''){
			MENULISTMODEL.delete(id,function(error){
				if(error){
					res.json({
						success:false,
						message:"Can not delete menu"
					});
					logger.info("ERROR delete menu api ",error);
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
	router.get("/api/menulist",db.isLoggedIn,function(req,res,next){
		var args = {};
		logger.info("request query",req.query);

		MENULISTMODEL.find("id, menuid, menulist, dateCreated, status",req.query,function(error,returnData){
	    	logger.info("MENU LIST ",returnData);
	    	if(!error){
	    		res.json(returnData);
	    	}
	    	else {
	    		logger.info("ERROR get api/menu",error);
	    		res.json({
	    			success :false,
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
