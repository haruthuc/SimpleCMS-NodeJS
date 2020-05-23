var express = require('express');
var router = express.Router();
var _ = require('lodash');
var async =require('async');
var uploaderConfig = require('../config').uploader;
var uploader = require("jquery-file-upload-middleware-fix");



module.exports = function(passport){

    uploader.configure(uploaderConfig);

    /// Redirect all to home except post
    router.get('/upload', function( req, res ){
        res.redirect('/');
    });

    router.put('/upload', function( req, res ){
        res.redirect('/');
    });

    router.delete('/upload', function( req, res ){
        res.redirect('/');
    });


    router.use('/upload/:id', function (req, res, next) {
            var id = req.params.id || "unknown";
            // imageVersions are taken from upload.configure()
            uploader.fileHandler({
                uploadDir: function () {
                    return 'public/uploads/' + id
                },
                uploadUrl: function () {
                    return '/uploads/' + id
                }
            })(req, res, next);

    });

    //router.use(uploader.fileHandler());


    // router.get('/upload', function (req, res) {
    //     uploader.get(req, res, function (obj) {
    //         res.send(JSON.stringify(obj));
    //     });
    // });
    //
    //
    //
    //
    // router.post('/upload/:id', function (req, res) {
    //     var id = req.params.id;
    //     if(id === 0) next(router);
    //     //todo save into database
    //     console.log("upload inage ",id);
    //     uploader.post(req, res, function (obj) {
    //         res.send(JSON.stringify(obj));
    //     });
    // });


return router;
};
