let _table = process.env.TBLEXT + "actions";

// DATABASE CONNECTION
const mysql = require('mysql');
const util = require('util');
var bcrypt = require('bcrypt');

// MONGO : DATABASE CONNECTION
let conn = require('../config/DbConnect');

// DB Connect
const connection = mysql.createConnection({
    host     : process.env.DBHOST,
	user     : process.env.DBUSER,
	password : process.env.DBPASS,
	database : process.env.DBNAME
});


module.exports = {

	getAction : async function(number) {
		return new Promise(function(resolve, reject) {

			let query = { number: number }
			
			conn.getDb().collection(_table).find(query).limit(1).toArray(function(err, result) {
					
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}

			});

		});
	},



	// writes to mongo
	put : async function(data) {
		return new Promise(function(resolve, reject) {

			conn.getDb().collection(_table).findOne({
				number: data.number
			}, 
			function(err, result) {
				if (err) { 	 	
					reject(err);
				} else {
					
					if (!result) {
						conn.getDb().collection(_table).insertOne(data, 
						function(err, res2) {
							if (err) throw err;

							if (res2) console.log('action created'); 
							// WRITE TO MYSQL
						});
					}

					resolve(result);
				}
			});


		});
	},

	getActionCodeMysql : async function(case_number) {
		return new Promise(function(resolve, reject) {
			
			let tableName = "action_codes";

			connection.query(`SELECT * FROM ${tableName} WHERE case_number = '${case_number}' order by id desc limit 1`,function(err,res,fields) {
				if (err) {
					reject(err);
			   } else {
					resolve(res);
			   }
			});

		});
	},

	// writes to mysql action_code
	putMysql : async function(data) {
		
		return new Promise(function(resolve, reject) {
			
			let tableName = "action_codes";
			let queryStr = `INSERT INTO  ${tableName} (case_number, action_code_type_id, action_code_campaign_id) VALUES ("${data.case_number}", ${data.action_code_type_id}, ${data.action_code_campaign_id})`;
			connection.query(queryStr,function(err,res,fields) {
				if (err) {
					reject(err);
			   } else {
				   console.log(res);
					resolve(res);
			   }
			});

		});


	},

	// writes to mysql action_code_routes
	putMysqlRoutes : async function(data) {
		
		return new Promise(function(resolve, reject) {
			
			let tableName = "action_routes";
			let queryStr = `INSERT INTO  ${tableName} (action_code_id, url, related_action_id) VALUES ("${data.action_code_id}", "${data.url}", ${data.related_action_id})`;
			connection.query(queryStr,function(err,res,fields) {
				if (err) {
					reject(err);
			   } else {
					resolve(res);
			   }
			});

		});


	},






	
	
};