// DATABASE CONNECTION
const mysql = require('mysql');
const util = require('util');
var bcrypt = require('bcrypt');

// MONGO : DATABASE CONNECTION
const mongoose = require('mongoose');
const mongoDb = process.env.MongoURILOCAL;
const mongoDbOptions = { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
};

// DB Connect
const mongoConnection = mongoose.createConnection(mongoDb, mongoDbOptions);


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
	},

	getUserByEmail : function(email) {
		return new Promise(function(resolve, reject) {
			
			connection.query('SELECT * FROM users WHERE email = ?',[email],function(err,res,fields) {
				if (err) {
					reject(err);
			   } else {
					resolve(res);
			   }
			});

		});
	},

	validateLogin : async function(email, password) {
		
		let user = await this.getUserByEmail(email);
		let isValid = false;
		

		if ( user.length > 0 ) {
			let hash = user[0].password;
			hash = hash.replace(/^\$2y(.+)$/i, '$2a$1');

			isValid = await this.compareAsync(password,hash);
		}

			
		

		return isValid;
	},

	putUser : async function(user) {
		return new Promise(function(resolve, reject) {


			// db.mongoConnection

			mongoConnection.collection("users").findOne({
				id: user.id
			}, 
			function(err, result) {
				if (err) {
					reject(err);
				} else {
					
					if (!result) {
						mongoConnection.collection("users").insertOne({
							...user
						}, 
						function(err, res2) {
							if (err) throw err;
							// res2.json(res2);
						});
					}

					resolve(result);
				}
			});


		});
	},
	
	
};