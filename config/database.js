// DATABASE CONNECTION
const mysql = require('mysql');
const connection = mysql.createConnection({
    host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'trd-dev'
});

// require('../repositories/users');

// require('./repositories/users');

module.exports = {

    connectToServer: function( callback ) {
        connection.connect((err) => {
            if (err) throw err;
            console.log('Connected!');
        });
    
    },

    getUserById: function( id ) {
        
        connection.query('SELECT * FROM users WHERE id = ?', [id],function(error, results, fields) {
			if (results.length > 0) {
				console.log(results);
			} 
		});
    
    },

    getCountries: function( callback ) {
        
        connection.query('SELECT * FROM users WHERE id = ?', [id],function(error, results, fields) {
			if (results.length > 0) {
				console.log(results);
			} 
		});
    
    }

};
