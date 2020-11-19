let _table = process.env.TBLEXT + "generated_pdf";
let conn = require('../config/DbConnect');


// console.log("host", process.env.DBHOST);
module.exports = {

	// GET
	getGeneratedPdfs: async function() {

        return new Promise(function(resolve, reject) {

            // conn.getDb().collection(_table).find(
			// 	function(err, result) {
			// 		if (err) {
			// 			reject(err);
			// 		} else {
	
			// 			resolve(result);
			// 		}
			// 	}
			// );

			
			conn.getDb().collection(_table).find().toArray(function(err, result) {
					
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}

			});
            
		});
		

		

	},
	
    // PUT 
    putGeneratedPdf: function(data) {

        conn.getDb().collection(_table).insertOne(data, 
			function(err, res2) {
				if (err) throw err;
			}
		);

    }
};