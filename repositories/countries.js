module.exports = {

    getUserById: function( id ) {
        
        return connection.query('SELECT * FROM users WHERE id = ?', [id], function(error, results, fields) {
			
			return results;
		});

		// return res;
    
    }
};