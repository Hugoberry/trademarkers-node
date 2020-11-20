let _table = process.env.TBLEXT + "senders";
let conn = require('../config/DbConnect');


// console.log("host", process.env.DBHOST);
module.exports = {

	// GET
	getSenders: async function() {

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

	getSenderById: async function(id) {

        return new Promise(function(resolve, reject) {

			conn.getDb().collection(_table).find(id).toArray(function(err, result) {
					
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}

			});
            
		});
		
	},
	
    // PUT 
    putSenders: function(data) {

        conn.getDb().collection(_table).insertOne(data, 
			function(err, res2) {
				if (err) throw err;
			}
		);

    }
};