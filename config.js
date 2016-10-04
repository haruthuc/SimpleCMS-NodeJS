var path = require('path');
var env = process.env.NODE_ENV || process.argv[2] || 'development';
if(env!="production") env = "development";
var uploaderOptions = {
  copyImgAsThumb: true,
  acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
  imageVersions: {
    "large" : {
        width : 600,
        height : 600
    },
    "small" : {
        width : 300,
        height : 430
    }
  },
  storage: {
    type: 'local'
  }
};

var config = {
	development : { //enviroment dev
		database : {
			client: "sqlite3", // client sqlite3
			connection: {
				filename : path.join(__dirname, '/data/simplecms.db') // file name of databse
			}
		},
		mail  : {
      fromName:"PHIMHAYHE Dev",
      fromEmail:"info@simplecms.io",
      tranport:{
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // use SSL
        auth: {
            user: 'simplecmsvietnam@gmail.com',
            pass: 'admin123!@#'
        }
      }
		},
		server : {
			secret: "#DI#MFPDMff22", // secret key for encrypt
			port : 2000 //config port web
		},
		frontend:{
      title : "Phim Hay He",
			template : "phimhayhe"
		},
		uploader : uploaderOptions
	},
	production : { //environment production
		database : {
			client: "sqlite3",
			connection: {
				filename : path.join(__dirname, '/data/simplecms.db')
			}
		},
		mail  : {
      fromName:"PHIMHAYHE",
      fromEmail:"info@simplecms.io",
      tranport:{
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // use SSL
        auth: {
            user: 'simplecmsvietnam@gmail.com',
            pass: 'admin123!@#'
        }
      }
		},
		server : {
			secret: "#DI#MFPDMff22",
			port : 2000
		},
		frontend:{
      title : "Phim Hay He",
			template : "phimhayhe"
		},
		uploader:uploaderOptions

	}

};

console.log("config for environment "+env);
console.log("configs "+config[env]);


module.exports = config[env];
