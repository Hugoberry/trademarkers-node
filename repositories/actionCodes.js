let _table = "tm.actioncodes";

let conn = require('../config/DbConnect');

// DATABASE CONNECTION
const mysql = require('mysql');
const util = require('util');

let ObjectID = require('mongodb').ObjectID;

const connection = mysql.createConnection({
    host     : process.env.DBHOST,
	user     : process.env.DBUSER,
	password : process.env.DBPASS,
	database : process.env.DBNAME
});

module.exports = {

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

	findByCode : async function(code) {
		return new Promise(function(resolve, reject) {

			let query = { code: code.toUpperCase() };

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

	

	put: async function(data) {
		return new Promise(function(resolve, reject) {
			conn.getDb().collection(_table).insertOne(data, 
				function(err, res2) {
					if (err) reject(err);

					resolve(res2);
				}
			);
		});

	},

	update: async function(id,data) {

        let query = { _id: ObjectID(id) };

		return new Promise(function(resolve, reject) { 

			conn.getDb().collection(_table).updateOne(query,{$set: data }, function(err, result) {
				if (err) {
					// console.log('Error updating user: ' + err);
					// res.send({'error':'An error has occurred'});
					reject(err)
				} else {
					// console.log('' + result + ' document(s) updated');
					// res.send(result);
					resolve(result)
				}
			});

		});

    }

}; 