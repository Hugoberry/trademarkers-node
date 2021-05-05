let _table = process.env.TBLEXT + "cartItems";
let conn = require('../config/DbConnect');

var ObjectID = require('mongodb').ObjectID;

let moment = require('moment');
const { toInteger } = require('lodash');

module.exports = {

	put: function(data) {

        conn.getDb().collection(_table).insertOne(data, 
			function(err, res2) {
				if (err) throw err;
			}
		);

	},
 
	fetchCustomerCart : async function(userId) {
		return new Promise(function(resolve, reject) {

			let query = { 
				userId: ObjectID(userId),
				status: 'active'
			};

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

	fetchCustomerActiveCart4hr : async function() {
		return new Promise(function(resolve, reject) {
			console.log(moment().subtract("4", "hours").format() );
			console.log(moment().subtract("3", "hours").format() );
			let query = { 
				status: 'active',
				created_at_formatted: { 
					$lt : moment().subtract("3", "hours").format(),
					$gte : moment().subtract("4", "hours").format(),
				},
			};

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

	fetchCustomerActiveCart1Day : async function() {
		return new Promise(function(resolve, reject) {

			let query = { 
				status: 'active',
				created_at_formatted: { 
					$lt : moment().subtract("23", "hours").format(),
					$gte : moment().subtract("24", "hours").format(),
				},
			};

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

	fetchCustomerActiveCart3Day : async function() {
		return new Promise(function(resolve, reject) {

			let query = { 
				status: 'active',
				created_at_formatted: { 
					$lt : moment().subtract("2", "days").format(),
					$gte : moment().subtract("3", "days").format(),
				},
			};

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

	fetchCustomerActiveCartMonth : async function() {
		return new Promise(function(resolve, reject) {

			let query = { 
				status: 'active',
				created_at_formatted: { 
					$lt : moment().subtract("29", "days").format(),
					$gte : moment().subtract("30", "days").format(),
				},
			};

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

	update: function(id,data) {

        let query = { _id: ObjectID(id) };

		conn.getDb().collection(_table).updateOne(query,{$set: data }, function(err, result) {

		});

	},
	
	remove: async function(id) {

		return new Promise(function(resolve, reject) {

			let query = { _id: ObjectID(id) };

			conn.getDb().collection(_table).deleteOne(query, function(err, result) {
				if (result) {
					console.log('ok');
					resolve(result)
				} else {
					console.log('err', err.message);
					reject(err);
				}
			});
		});

    }

};