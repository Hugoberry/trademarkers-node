let _table = process.env.TBLEXT + "activities";
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
	
	getAll : async function() {
		return new Promise(function(resolve, reject) {

			
			
			conn.getDb().collection(_table).find().toArray(function(err, result) {
					
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}

			});

		});
	},

	getAllLatest : async function() {
		return new Promise(function(resolve, reject) {

			let query = { created_at_formatted: { 
				$gte : moment().subtract("4", "days").format()
			} }

			let field = { fields : { ip: 1, user:1, uri: 1, activity: 1, created_at_formatted: 1 } };
			
			conn.getDb().collection(_table).find(query, field).toArray(function(err, result) {
					
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}

			});

		});
	},

	getById : async function(id) {
		return new Promise(function(resolve, reject) {

			let query = { _id: ObjectID(id) };

			let db = conn.getDb();
			
			db.collection(_table).find(query).toArray(function(err, result) {
					
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}

			});

		});
	},
};