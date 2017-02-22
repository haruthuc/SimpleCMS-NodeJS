var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
var db = require('./db.js');
var USERMODEL = new db.USERMODEL();
var crypto = require('crypto');
var logger = require("./logger.js");

passport.use(new LocalStrategy(
  function(username, password, done) {
    logger.info("username","password",username,password);
    USERMODEL.findOne({ username: username }, function (err, user) {

      logger.info("user authen",user);
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }

      if(user){
        var pass = user['password'];
        if (pass != crypto.createHash('md5').update(password).digest('hex')) {
            return done(null, false, { message: 'Incorrect password.' });
          }
          return done(null, user);
      }
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  USERMODEL.findOne({"id":id}, function(err, user) {
    done(err, user);
  });
});


module.exports = passport;
