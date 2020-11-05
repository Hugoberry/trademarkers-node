// DATABASE CONNECTION
const mysql = require('mysql');
const util = require('util');

const connection = mysql.createConnection({
    host     : process.env.DBHOST,
	user     : process.env.DBUSER,
	password : process.env.DBPASS,
	database : process.env.DBNAME
});

module.exports = {

	getUserTask : function() {
		return new Promise(function(resolve, reject) {
			
			connection.query('SELECT * FROM users WHERE email = ?',[email],function(err,res,fields) {
				if (err) {
					reject(err);
			   } else {
					resolve(res);
			   }
			});

		});
	}

	
	
};