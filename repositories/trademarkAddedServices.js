let _table = process.env.TBLEXT + "trademarksAddedServices";
let conn = require('../config/DbConnect');
let ObjectID = require('mongodb').ObjectID;

let moment = require('moment');
const { toInteger } = require('lodash');


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
			
			conn.getDb().collection(_table).find(query).toArray(function(err, result) {
					
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}

			});

		});
	},

	getByTrademarkId : async function(id) {
		return new Promise(function(resolve, reject) {

			let query = { trademarkId: id };
			
			conn.getDb().collection(_table).find(query).toArray(function(err, result) {
					
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}

			});

		});
	},

	
	updateDetails: function(id,data) {

		
		let query = { _id: ObjectID(id) };
		
		conn.getDb().collection(_table).updateOne(query,{$set: data }, function(err, result) {
			if (err) {
				console.log('Error updating user: ' + err);
				// res.send({'error':'An error has occurred'});
			} else {
				console.log('' + result + ' document(s) updated');
				// res.send(result);
			}
		});

	},
	
	put: function(data) {

		return new Promise(function(resolve, reject) {

        conn.getDb().collection(_table).insertOne(data, 
			function(err, res) {
				if (err) {
					reject(err);
				} else {
					resolve(res)
				}
			}
		);

		})

	},

	
	
};