let _table = process.env.TBLEXT + "tasks";
let conn = require('../config/DbConnect');
let ObjectID = require('mongodb').ObjectID;


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

	getResearcherTask : async function(user_id) {
		return new Promise(function(resolve, reject) {

			let query = { user_id: user_id, task_status: "pending" };
			
			conn.getDb().collection(_table).find(query).toArray(function(err, result) {
					
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}

			});

		});
	},

	getTaskById : async function(id) {
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
	
	putTask: function(data) {

        conn.getDb().collection(_table).insertOne(data, 
			function(err, res2) {
				if (err) throw err;
			}
		);

	},
	
	putTaskDetails: function(data) {

        conn.getDb().collection(_table).insertOne(data, 
			function(err, res2) {
				if (err) throw err;
			}
		);

	},
	
	updateDetails: function(id,data) {

		let query = { _id: ObjectID(id) };

		conn.getDb().collection(_table).updateOne(query,  {$set:{details: data}}, function(err, result) {
			if (err) {
				console.log('Error updating user: ' + err);
				// res.send({'error':'An error has occurred'});
			} else {
				console.log('' + result + ' document(s) updated');
				// res.send(result);
			}
		});

	},
	
	updateTask: function(id,data) {

		let query = { _id: ObjectID(id) };

		conn.getDb().collection(_table).updateOne(query,  {$set:data}, function(err, result) {
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