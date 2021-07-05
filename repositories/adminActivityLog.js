let _table = process.env.TBLEXT + "admin_activities";
let conn = require('../config/DbConnect');

let ObjectID = require('mongodb').ObjectID;

let moment = require('moment');

// dirty connection MYSQL
const mysql = require('mysql');
const connection = mysql.createConnection({
    host     : process.env.DBHOST,
	user     : process.env.DBUSER,
	password : process.env.DBPASS,
	database : process.env.DBNAME
});

module.exports = {

    activity: function(data) {

        conn.getDb().collection(_table).insertOne(data, 
		function(err, res2) {
			if (err) throw err;
		});

	},

	getLogs : async function(type, id) {
		return new Promise(function(resolve, reject) {

			let query = { "objId" : ObjectID(id), "objType" : type };
			
			conn.getDb().collection(_table).find(query).toArray(function(err, result) {
					
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}

			});

		});
	},
	
	
}; 