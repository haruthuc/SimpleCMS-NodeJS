var path = require('path');


var uploaderOptions = {
  tmpDir: __dirname + '/../public/uploaded/tmp',
  uploadDir: __dirname + '/../public/uploaded/files',
  uploadUrl: '/uploaded/files/',
  copyImgAsThumb: true,
  imageVersions: {
    maxWidth: 200,
    maxHeight: 'auto',
    "large" : {
        width : 600,
        height : 600
    },
    "medium" : {
        width : 300,
        height : 300
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
/*
var uploaderOptions = {
    tmpDir:  __dirname + '/../public/uploaded/tmp',
    uploadDir: __dirname + '/../public/uploaded/files',
    uploadUrl:  '/uploaded/files/',
    maxPostSize: 11000000000, // 11 GB
    minFileSize:  1,
    maxFileSize:  10000000000, // 10 GB
    acceptFileTypes:  /.+/i,
    // Files not matched by this regular expression force a download dialog,
    // to prevent executing any scripts in the context of the service domain:
    inlineFileTypes:  /\.(gif|jpe?g|png)/i,
    imageTypes:  /\.(gif|jpe?g|png)/i,
    copyImgAsThumb : true, // required
    imageVersions :{
        maxWidth : 200,
        maxHeight : 200
    },
    accessControl: {
        allowOrigin: '*',
        allowMethods: 'OPTIONS, HEAD, GET, POST, PUT, DELETE',
        allowHeaders: 'Content-Type, Content-Range, Content-Disposition'
    },
    storage : {
        type : 'aws',
        aws : {
            accessKeyId :  'xxxxxxxxxxxxxxxxx',
            secretAccessKey : 'xxxxxxxxxxxxxxxxx',
            region : 'us-east-1',//make sure you know the region, else leave this option out
            bucketName : 'xxxxxxxxxxxxxxxxx'
        }
    }
};
*/

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

module.exports = config;
