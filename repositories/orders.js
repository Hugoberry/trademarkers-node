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

	findActionCustom : async function(number) {
		return new Promise(function(resolve, reject) {

			let query = { action: number };

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

	// put: function(data) {

    //     conn.getDb().collection(_table).insertOne(data, 
	// 		function(err, res2) {
	// 			if (err) throw err;
	// 		}
	// 	);

	// },

	put : async function(data) {
		return new Promise(function(resolve, reject) {


			// let db = conn.getDb();

			conn.getDb().collection(_table).findOne({
				customerId: data.customerId
			}, 
			function(err, result) {
				if (err) {
					reject(err);
				} else {
					
					if (!result) {
						conn.getDb().collection(_table).insertOne(data, 
						function(err, res2) {
							if (err) throw err;
						});
					}

					resolve(result);
				}
			});


		});
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

	fetchOrderByUser: function ( user_id ) {

		return new Promise(function(resolve, reject) {
			// let query = `SELECT 
			// 				u.id as user_id,
			// 				u.name as user_name,
			// 				u.email as user_email,
			// 				u.password as user_password,
			// 				u.role_id as user_role,
			// 				u.created_at as user_created_date,
			// 				o.id as order_id,
			// 				o.order_number,
			// 				o.created_at as order_created_date,
			// 				o.total_amount as order_total_amount
			// 			FROM orders o 
			// 			LEFT JOIN users u on o.user_id = u.id
			// 			ORDER BY u.id`;
			let query = `SELECT * FROM orders WHERE user_id = ${user_id}`;
			connection.query(query,function(err,res,fields) {
				if (err) {
					reject(err);
			} else {
					resolve(res);
			}
			});
		});

	},
}; 