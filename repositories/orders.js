let _table = process.env.TBLEXT + "orders";

let conn = require('../config/DbConnect');

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

	findById : async function(id) {
		return new Promise(function(resolve, reject) {

			let query = { id: id };

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

	findOrderNumber : async function(number) {
		return new Promise(function(resolve, reject) {

			let query = { orderNumber: number };

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

	putCart: function(data) {

        conn.getDb().collection(_table).insertOne(data, 
			function(err, res2) {
				if (err) throw err;
			}
		);

	},

	put: function(data) {

        conn.getDb().collection(_table).insertOne(data, 
			function(err, res2) {
				if (err) throw err;
			}
		);

	},
	
	fetchOrder: function ( order_number ) {

		return new Promise(function(resolve, reject) {
			connection.query('SELECT * FROM orders WHERE order_number = ?',[order_number],function(err,res,fields) {
				if (err) {
					reject(err);
			} else {
					resolve(res);
			}
			});
		});

	},
}; 