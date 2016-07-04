var path = require('path');
var env = process.env.NODE_ENV || process.argv[2] || 'development';
if(env!="production") env = "development";
var uploaderOptions = {
  //tmpDir: __dirname + '/public/uploads/tmp',
  //uploadDir: __dirname + '/public/uploads/files',
  //uploadUrl: '/uploads/files',
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
  },
    accessControl: {
        allowOrigin: '*',
        allowMethods: 'OPTIONS, HEAD, GET, POST, PUT, DELETE'
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

		},
		server : {
			secret: "#DI#MFPDMff22", // secret key for encrypt
			port : 2000 //config port web
		},
		frontend:{
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

		},
		server : {
			secret: "#DI#MFPDMff22",
			port : 2000
		},
		frontend:{
			template : "khaianhouse"
		},
		uploader:uploaderOptions

	}

};

console.log("config for environment "+env);
console.log("configs "+config[env]);


module.exports = config[env];
