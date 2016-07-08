var express = require('express');
var router = express.Router();
var db = require('../helpers/db.js');
var MENUMODEL = new db.MENUMODEL();
var TAGMODEL = new db.TAGMODEL();
var CONTENTMODEL = new db.CONTENTMODEL();
var USERMODEL = new db.USERMODEL();
var _ = require('lodash');
var async =require('async');
var crypto = require('crypto');
var sanitizeHtml = require('sanitize-html');

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
		console.log("session",req.session);
		if(req.session.passport && req.session.passport.user){
			USERMODEL.findOne({"id":req.session.passport.user}, function(err, user) {
		  	res.render('admin/profile', { title: 'Simple CMS',active:"profile", profile:user});
		  });

		}else{
			res.redirect("/");
		}

	});

	router.get('/newpage', db.isLoggedIn, function(req, res, next) {
	  res.render('admin/newpage', { title: 'Simple CMS - Add new page',active:"newpage"});
	});

	router.get('/newpage/:contentID', db.isLoggedIn, function(req, res, next) {
		var contentID = req.params.contentID;
		CONTENTMODEL.findOne({"id":contentID},function(error,content){
			if(error){
				console.log("ERROR get one page by content id",contentID);
				res.redirect("/admin/newpage");
			}else{
				if(content){
					res.render('admin/newpage', {
							title: 'Simple CMS - Add new page',
							active: "newpage",
							contentID: req.params.contentID,
							contentTitle: content['title'],
							picture: content['picture'],
							datePublish : content['datePublish'],
							content : content['content'],
							tags : content['tags']
							});
				}else{
					res.redirect("/newpage");
				}
			}
		});

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
				MENUMODEL.add(req.body,function(error,id){
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

//begin tag api
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
				TAGMODEL.add(req.body,function(error,id){
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

//end tag api

//Begin content api
router.post("/api/content",db.isLoggedIn,function(req,res,next){
	if(req.body){
		if(req.body.title!=''){
			req.body.alias = db.makeAliasLink(req.body.title);

			if(req.body.content){
					var clean = sanitizeHtml(req.body.content);
					req.body.content = clean;
			}

			CONTENTMODEL.add(req.body,function(error,id){
				if(error){
					res.json({
						success:false,
						message:"Can not content tag"
					});
					console.log("ERROR add content api ",error);
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
		console.log("update content",req.body);
		if(req.body.title)
			req.body.alias = db.makeAliasLink(req.body.title);
		if(req.body.content){
				var clean = sanitizeHtml(req.body.content);
				req.body.content = clean;
		}
		//var data = JSON.parse(req.body);
		CONTENTMODEL.update(req.body,function(err){
				// results is now an array of stats for each file
				if(err){
					console.log('update content error ',err);
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
		console.log("update content invalid data");
		res.json({
				success:false,
				message: "Invalid data"
			});
	}
});

//update profile
router.put("/api/profile",db.isLoggedIn,function(req,res,next){
	if(req.body){
		console.log("update profile",req.body);
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
								console.log('update content error ',err);
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
						console.log("update password error",err);
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
		console.log("update content invalid data");
		res.json({
				success:false,
				message: "Invalid data"
			});
	}
});


//get list menu
router.get("/api/content",db.isLoggedIn,function(req,res,next){
	var args = {};
	console.log("request query",req.query);

	CONTENTMODEL.find("id,title,tags,picture,dateCreated,datePublish",req.query,function(error,returnData){
			console.log("PAGE ",returnData);
			if(!error){
				res.json(returnData);
			}
			else {
				console.log("ERROR get api/content",error);
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
				console.log("ERROR delete content api ",error);
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

	// =====================================
	// LOGOUT ==============================
	// =====================================
	router.get('/logout', function(req, res) {
	    req.logout();
	    res.redirect('/admin');
	});

	return router;
};
