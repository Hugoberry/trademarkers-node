let _table = process.env.TBLEXT + "charge";
let conn = require('../config/DbConnect');
var ObjectID = require('mongodb').ObjectID;

let moment = require('moment');

module.exports = {

	getAll : async function() {
		return new Promise(function(resolve, reject) {

			lection(_table).find().toArray(function(err, result) {
					
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}

			});

		});
	},

	put : async function(data) {

		conn.getDb().collection(_table).insertOne(data, 
		function(err, res2) {
			if (err) throw err;
		});
	},

	
};