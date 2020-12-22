let _table = process.env.TBLEXT + "domains";
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

	getDomain : async function(domainName) {
		return new Promise(function(resolve, reject) {

			let query = { domain_name: domainName };
			
			conn.getDb().collection(_table).find(query).toArray(function(err, result) {
					
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}

			});

		});
	},

	getByOppositionId : async function(id) {
		return new Promise(function(resolve, reject) {

			let query = { opposition_id: ObjectID(id) };
			
			conn.getDb().collection(_table).find(query).toArray(function(err, result) {
					
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}

			});

		});
	},



	
	// put: async function(data) {
	// 	return new Promise(function(resolve, reject) {
    //     conn.getDb().collection(_table).insertOne(data, 
	// 		function(err, res2) {
	// 			if (err) {
	// 				reject(err);
	// 			}

	// 			resolve(res2);
	// 		}
	// 	);

	// 	});

	// },

	put : async function(domain) {
		return new Promise(function(resolve, reject) {


			// let db = conn.getDb();

			conn.getDb().collection(_table).findOne({
				domain_name: domain.domain_name
			}, 
			function(err, result) {
				if (err) {
					reject(err);
				} else {
					
					if (!result) {
						conn.getDb().collection(_table).insertOne(domain, 
						function(err, res2) {
							if (err) throw err;
						});
					}

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

    }

	
	
};