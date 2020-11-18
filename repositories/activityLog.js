let _table = process.env.TBLEXT + "activities";
let conn = require('../config/DbConnect');

// dirty connection MYSQL
const mysql = require('mysql');
const connection = mysql.createConnection({
    host     : process.env.DBHOST,
	user     : process.env.DBUSER,
	password : process.env.DBPASS,
	database : process.env.DBNAME
});

module.exports = {

    activity: function(data) {

        conn.getDb().collection(_table).insertOne(data, 
		function(err, res2) {
			if (err) throw err;
		});

    }
};