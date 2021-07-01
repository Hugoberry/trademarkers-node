let _table = process.env.TBLEXT + "comments";
let ObjectID = require('mongodb').ObjectID;
let conn = require('../config/DbConnect');

let mailService = require('../services/mailerService')

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

	fetchTmComments : async function(id) {
		return new Promise(function(resolve, reject) {

			let query = { trademarkId: ObjectID(id) };

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
				function(err, result) {
					if (err) throw err;

					mailService.notifyNewAccount(data)
					mailService.verifyEmailAccount(data)
					resolve(result);
				}
			);
		});

	},
	
	update: async function(id,data) {

        let query = { _id: ObjectID(id) };

		return new Promise(function(resolve, reject) { 

			conn.getDb().collection(_table).updateOne(query,{$set: data }, function(err, result) {
				if (err) {
					console.log('Error updating user: ' + err);
					// res.send({'error':'An error has occurred'});
					reject(err)
				} else {
					console.log('' + result + ' document(s) updated');
					// res.send(result);
					resolve(result)
				}
			});

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