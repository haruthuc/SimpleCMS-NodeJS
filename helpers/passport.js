var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
var db = require('./db.js');
var USERMODEL = new db.USERMODEL();
var crypto = require('crypto');


passport.use(new LocalStrategy(
  function(username, password, done) {
    console.log("username","password",username,password);
    USERMODEL.findOne({ username: username }, function (err, users) {

      console.log("user authen",users);
      if (err) { return done(err); }
      if (!users || users.length < 1) {
        return done(null, false, { message: 'Incorrect username.' });
      }

      if(users.length >0 ){
        var pass = users[0]['password'];
        if (pass != crypto.createHash('md5').update(password).digest('hex')) {
            return done(null, false, { message: 'Incorrect password.' });
          }
          return done(null, users[0]);

      }

    
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  USERMODEL.findOne({"id":id}, function(err, users) {
    done(err, users[0]);
  });
});


module.exports = passport;