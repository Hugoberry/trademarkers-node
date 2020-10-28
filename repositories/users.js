// DATABASE CONNECTION
const mysql = require('mysql');
const util = require('util');
var bcrypt = require('bcrypt');

const connection = mysql.createConnection({
    host     : process.env.DBHOST,
	user     : process.env.DBUSER,
	password : process.env.DBPASS,
	database : process.env.DBNAME
});

module.exports = {

    validateUser: async function ( email, password ) {

		const query = util.promisify(connection.query).bind(connection);
		var isValid = false;
	
			try {
				const rows = await query('SELECT * FROM users WHERE email = ?', [email]);
				// return rows;
				if ( rows.length > 0 ) {
					
					var hash = rows[0].password;
					hash = hash.replace(/^\$2y(.+)$/i, '$2a$1');

					return await this.compareAsync(password, hash);

				}

				return isValid;

			} catch(e) {
				console.log(e);
			}

	},
	
	compareAsync : function(p1, p2) {
		return new Promise(function(resolve, reject) {
			bcrypt.compare(p1, p2, function(err, res) {
				if (err) {
					 reject(err);
				} else {
					 resolve(res);
				}
			});
		});
	}
	
	
};