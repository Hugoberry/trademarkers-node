module.exports = {

    getUsers: function( callback ) {
        
        connection.query('SELECT * FROM users WHERE email = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				console.log(results);
			} 
		});
    
    }
};