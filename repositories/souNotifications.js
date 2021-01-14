let _table = process.env.TBLEXT + "sou_notifications";
let conn = require('../config/DbConnect');
var ObjectID = require('mongodb').ObjectID;

let moment = require('moment');


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



	
	put : async function(data) {
		return new Promise(function(resolve, reject) {


			// let db = conn.getDb();

			conn.getDb().collection(_table).findOne({
				orderId: data.orderId
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
	}

	
	
	
};