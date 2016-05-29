var path = require('path');

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
		}

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
		}

	}

};

module.exports = config;