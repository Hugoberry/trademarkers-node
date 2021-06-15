let _table = "euipo";
let ObjectID = require('mongodb').ObjectID;
let conn = require('../config/DbConnect');

let mailService = require('../services/mailerService')

module.exports = {

	getAll : async function() {
		return new Promise(function(resolve, reject) {

			let db = conn.getDbEU();
			
			db.collection(_table).find().limit(1).toArray(function(err, result) {
						
					if (err) {
						reject(err);
					} else {
						resolve(result);
					}

			});
	

		});
	},

	findByCode : async function(number) {
		return new Promise(function(resolve, reject) {

			let query = { number: number };

			let db = conn.getDbEU();
			
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