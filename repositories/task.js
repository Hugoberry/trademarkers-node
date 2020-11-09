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

	getUserTask : async function(id) {
		return new Promise(function(resolve, reject) {
			
			connection.query('SELECT * FROM tasks WHERE researcher_id = ? limit 1',[id],function(err,res,fields) {
				if (err) {
					reject(err);
			   } else {
					resolve(res);
			   }
			});

		});
	},

	getUserTaskDetails : async function(id) {
		return new Promise(function(resolve, reject) {
			
			connection.query('SELECT * FROM task_details WHERE task_id = ?',[id],function(err,res,fields) {
				if (err) {
					reject(err);
			   } else {
					resolve(res);
			   }
			});

		});
	}

	
	
};