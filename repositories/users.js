// DATABASE CONNECTION
const mysql = require('mysql');
const connection = mysql.createConnection({
    host     : process.env.DBHOST,
	user     : process.env.DBUSER,
	password : process.env.DBPASS,
	database : process.env.DBNAME
});

module.exports = {

    // getUserById: function( id ) {
        
    //     return connection.query('SELECT * FROM users WHERE id = ?', [id], function(error, results, fields) {
			
	// 		return results;
	// 	});

	// 	// return res;
    
    // }
};