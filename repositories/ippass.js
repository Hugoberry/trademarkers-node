let _table = "ippass";
let conn = require('../config/DbConnect');
var ObjectID = require('mongodb').ObjectID;

let moment = require('moment');


module.exports = {


	put: function(data) {

        conn.getDb().collection(_table).insertOne(data, 
			function(err, res2) {
				if (err) throw err;
			}
		);

	},


	
};