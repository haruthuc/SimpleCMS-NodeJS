var nodemailer = require('nodemailer');
var config = require('../config').mail;
// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport(config.tranport);
var htmlToText = require('nodemailer-html-to-text').htmlToText;
// setup e-mail data with unicode symbols
var mailOptions = {
    from: config.fromName+" "+config.fromEmail, // sender address
};
var logger = require("./logger.js");


function sendMail(to,subject,content,callback){
  mailOptions.to = to;
  mailOptions.subject = subject;
  //mailOptions.text = content;
  mailOptions.html = content;
  transporter.use('compile', htmlToText());
  // send mail with defined transport object
  transporter.sendMail(mailOptions, function(error, info){
      if(error){
          return logger.info(error);
      }
      logger.info('Message sent: ' + info.response);
      callback(error,info);
  });

}

exports.sendAsync = function(to,subject,content){
    sendMail(to,subject,content,function(){});
    return true;
}
exports.send = function(to,subject,content,callback){
    sendMail(to,subject,content,callback);
}
