let _table = process.env.TBLEXT + "orders";

let conn = require('../config/DbConnect');

// DATABASE CONNECTION
const mysql = require('mysql');
const util = require('util');

var ObjectID = require('mongodb').ObjectID;

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

	getByUserId : async function(userId) {
		return new Promise(function(resolve, reject) {

			let query = { userId: ObjectID(userId) };

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

	// put : async function(data) {
	// 	return new Promise(function(resolve, reject) {


	// 		// let db = conn.getDb();

	// 		conn.getDb().collection(_table).findOne({
	// 			customerId: data.customerId
	// 		}, 
	// 		function(err, result) {
	// 			if (err) {
	// 				reject(err);
	// 			} else {
					
	// 				if (!result) {
	// 					conn.getDb().collection(_table).insertOne(data, 
	// 					function(err, res2) {
	// 						if (err) throw err;
	// 					});
	// 				}

	// 				resolve(result);
	// 			}
	// 		});


	// 	});
	// },
	
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
	

	fetchOrderByUserMongo: function (id) {

		return new Promise(function(resolve, reject) {
			
			let query = { customerId: id };

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

	update: async function(id,data) {

		return new Promise(function(resolve, reject) {

			let query = { _id: ObjectID(id) };

			conn.getDb().collection(_table).updateOne(query,{$set: data }, function(err, result) {
				if (result) {
			
					resolve(result)
				} else {
		
					reject(err);
				}
			});

		});

	},
}; 