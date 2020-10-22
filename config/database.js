// DATABASE CONNECTION
const mysql = require('mysql');
const connection = mysql.createConnection({
    host     : process.env.DBHOST,
	user     : process.env.DBUSER,
	password : process.env.DBPASS,
	database : process.env.DBNAME
});


module.exports = {

    connectToServer: function( callback ) {
        connection.connect((err) => {
            if (err) throw err;
            console.log('Connected!');
        });
    
    },

    // getUserById: function( id ) {
        
    //     connection.query('SELECT * FROM users WHERE id = ?', [id],function(error, results, fields) {
	// 		if (results.length > 0) {
	// 			console.log(results);
	// 		} 
	// 	});
    
    // },

    // getCountries: function( callback ) {
        
    //     connection.query('SELECT * FROM users WHERE id = ?', [id],function(error, results, fields) {
	// 		if (results.length > 0) {
	// 			console.log(results);
	// 		} 
	// 	});
    
    // }

};
