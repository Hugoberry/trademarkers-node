let _table = process.env.TBLEXT + "events";
let conn = require('../config/DbConnect');



module.exports = {


	getAllTask : async function() {
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

	getResearcherEvents : async function(user_id) {
		return new Promise(function(resolve, reject) {

			let query = { user_id: user_id };
			
			conn.getDb().collection(_table).find(query).toArray(function(err, result) {
					
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}

			});

		});
	},

	getResearcherEventById : async function(id) {
		return new Promise(function(resolve, reject) {

			// let query = { _id: id };
			
			conn.getDb().collection(_table).find(id).toArray(function(err, result) {
					
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}

			});

		});
	},
	
	putEvent: async function(data) {
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

		var ObjectID = require('mongodb').ObjectID;
		let query = { _id: ObjectID(id) };
		console.log(id,data);
		conn.getDb().collection(_table).updateOne(query,{$set: data }, function(err, result) {
			if (err) {
				console.log('Error updating user: ' + err);
				// res.send({'error':'An error has occurred'});
			} else {
				console.log('' + result + ' document(s) updated');
				// res.send(result);
			}
		});

    }

	
	
};