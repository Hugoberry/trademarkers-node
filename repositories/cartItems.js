let _table = process.env.TBLEXT + "cartItems";
let conn = require('../config/DbConnect');

var ObjectID = require('mongodb').ObjectID;

// dirty connection MYSQL
const mysql = require('mysql');
const connection = mysql.createConnection({
    host     : process.env.DBHOST,
	user     : process.env.DBUSER,
	password : process.env.DBPASS,
	database : process.env.DBNAME
});

module.exports = {

	put: function(data) {

        conn.getDb().collection(_table).insertOne(data, 
			function(err, res2) {
				if (err) throw err;
			}
		);

	},
 
	fetchCustomerCart : async function(user_id) {
		return new Promise(function(resolve, reject) {

			let query = { 
				user_id: ObjectID(user_id),
				status: 'pending'
			};

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

	update: function(id,data) {

        let query = { _id: ObjectID(id) };

		conn.getDb().collection(_table).updateOne(query,{$set: data }, function(err, result) {
			// if (err) {
			// 	console.log('Error updating user: ' + err);
			// 	// res.send({'error':'An error has occurred'});
			// } else {
			// 	// console.log('' + result + ' document(s) updated');
			// 	// res.send(result);
			// }
		});

    }

};