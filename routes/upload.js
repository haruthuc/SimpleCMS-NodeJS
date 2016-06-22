var express = require('express');
var router = express.Router();
var db = require('../helpers/db.js');
var MENUMODEL = new db.MENUMODEL();
var TAGMODEL = new db.TAGMODEL();
var CONTENTMODEL = new db.CONTENTMODEL();
var _ = require('lodash');
var async =require('async');

module.exports = function(passport){
  
    router.get('/upload', function (req, res) {
        uploader.get(req, res, function (obj) {
            res.send(JSON.stringify(obj));
        });
    });

    router.post('/upload/:id', function (req, res) {
        uploader.post(req, res, function (obj) {
            res.send(JSON.stringify(obj));
        });
    });

    router.delete('/uploaded/files/:name', function (req, res) {
        uploader.delete(req, res, function (obj) {
            res.send(JSON.stringify(obj));
        });
  });


return router;
};
