var path = require('path');
var env = process.env.NODE_ENV || process.argv[2] || 'development';
if(env!="production") env = "development";
var uploaderOptions = {
  copyImgAsThumb: true,
  imageVersions: {
    maxWidth: 200,
    maxHeight: 'auto',
    "large" : {
        width : 600,
        height : 600
    },
    "small" : {
        width : 150,
        height : 150
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
      fromName:"Info Dev",
      fromEmail:"info@simplecms.io",
      tranport:{
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // use SSL
        auth: {
            user: 'simplecmsvietnam@gmail.com',
            pass: 'cMs123$%^'
        }
      }
		},
		server : {
			secret: "#DI#MFPDMff22", // secret key for encrypt
			port : 2000 //config port web
		},
		frontend:{
      title : "Khai An House - The best real service",
			template : "khaianhouse"
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
      fromName:"Info",
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
      title : "Khai An House - The best real service",
			template : "khaianhouse"
		},
		uploader:uploaderOptions

	}

};

console.log("config for environment "+env);
console.log("configs "+config[env]);


module.exports = config[env];
