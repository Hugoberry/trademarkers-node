let _table = process.env.TBLEXT + "service_action";
let conn = require('../config/DbConnect');
var ObjectID = require('mongodb').ObjectID;


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

	findByCode : async function(code) {
		return new Promise(function(resolve, reject) {

			let query = { code: code };

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
			function(err, res2) {
				if (err) {
					reject(err);
				}

				resolve(res2);
			}
		);

		});

	},
	

	
	updateDetails: function(id,data) {

		
		let query = { _id: ObjectID(id) };

		conn.getDb().collection(_table).updateOne(query,{$set: data }, function(err, result) {
			if (err) {
				// console.log('Error updating user: ' + err);
				// res.send({'error':'An error has occurred'});
			} else {
				// console.log('' + result + ' document(s) updated');
				// res.send(result);
			}
		});

    }

	
	
};