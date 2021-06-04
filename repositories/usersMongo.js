let _table = process.env.TBLEXT + "users";
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

	findUser : async function(email) {
		return new Promise(function(resolve, reject) {

			let query = { email: email };

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

	findUserNo : async function(userNo) {
		return new Promise(function(resolve, reject) {

			let query = { userNo: userNo };

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

	getResearchers : async function() {
		return new Promise(function(resolve, reject) {

			let query = { role_id: 4 };

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

	getResearchersById : async function(_id) {
		return new Promise(function(resolve, reject) {

			// let query = { role_id: 4 };

			let db = conn.getDb();
			
			db.collection(_table).find(_id).toArray(function(err, result) {
					
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

	getByIdM : async function(id) {
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

	putUser: async function(data) {

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
	
	updateUser: async function(id,data) {

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

    }
};