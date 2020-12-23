let _table = process.env.TBLEXT + "events";
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
				event_type: data.event_type,
				opposition_id: data.opposition_id
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
	},

	// OLD IMPLEMENTATION
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

	addMailed: function(id,data) {

		
		let query = { _id: ObjectID(id) };

		conn.getDb().collection(_table).updateOne(query,{$set: data }, function(err, result) {
			if (err) {
				console.log('Error updating user: ' + err);
				// res.send({'error':'An error has occurred'});
			} else {
				console.log('' + result + ' document(s) event updated');
				// res.send(result);
			}
		});

	},

	
	getlimitData : async function($limit) {
		return new Promise(function(resolve, reject) {

			let yesterday = moment().subtract(1, "days").toDate();
			// console.log(yesterday);
			let query = { 
				// "last_crawl": { $exists:false }
				"last_crawl": { $lte: yesterday }
			};
			
			conn.getDb()
				.collection(_table)
				.find(query)
				.limit($limit)
				.toArray(function(err, result) {
					
					if (err) {
						reject(err);
					} else {
						resolve(result);
					}

				});

		});
	},

	getId : async function(id) {
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

	
	
};