let _table = process.env.TBLEXT + "users";

let conn = require('../config/DbConnect');

module.exports = {

	findUser : async function(email) {
		return new Promise(function(resolve, reject) {

			let query = { email: email };

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

	putUser: function(data) {

        conn.getDb().collection(_table).insertOne(data, 
			function(err, res2) {
				if (err) throw err;
			}
		);

    }
};