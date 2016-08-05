var assert = require('chai').assert;
var db = require('../helpers/db.js');
var chai = require('chai'), should = chai.should();
var crypto = require('crypto');
var utils = require('../helpers/utils.js');

describe('TEST MENUS', function(){

  it('TEST MULTILEVEL MENUS', function(done){
       utils.get_multilevel_menu_helper(function(){
          done();
       });

  });
	return;
});
