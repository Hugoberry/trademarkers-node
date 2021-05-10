let _table = process.env.TBLEXT + "countries";
let conn = require('../config/DbConnect');

let ObjectID = require('mongodb').ObjectID;
// dirty connection MYSQL
const mysql = require('mysql');
const connection = mysql.createConnection({
    host     : process.env.DBHOST,
	user     : process.env.DBUSER,
	password : process.env.DBPASS,
	database : process.env.DBNAME
});

module.exports = {

    putCountry: function(country) {

        conn.getDb().collection(_table).findOne({
            id: country.id
        }, 
        function(err, result) {
            if (err) { throw err
               
            } else {
                
                if (!result) {
                    conn.getDb().collection(_table).insertOne({
                        ...country
                    }, 
                    function(err, res2) {
                        if (err) throw err;
                    });
                }
            }
        });

    },

    getAll : async function() {
		return new Promise(function(resolve, reject) {

			let query = { 
				"name" : { $exists : true } 
			}
			conn.getDb().collection(_table).find(query).sort( { "name": 1 } ).toArray(function(err, result) {
					
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}

			});

		});
    },
    
    getById : async function(id) {
		return new Promise(function(resolve, reject) {

			
			let query = { id: id };
			
			conn.getDb().collection(_table).find(query).toArray(function(err, result) {
					
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}

			});

		});
	},

	getByIdM : async function(id) {
		return new Promise(function(resolve, reject) {

			let query = { _id: ObjectID(id) };
			
			conn.getDb().collection(_table).find(query).toArray(function(err, result) {
					
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}

			});

		});
	},

	getByContinent : async function(id) {
		return new Promise(function(resolve, reject) {

			
			let query = { continent_id: id };
			
			conn.getDb().collection(_table).find(query).toArray(function(err, result) {
					
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}

			});

		});
	},

	getByName : async function(name) {
		return new Promise(function(resolve, reject) {

			
			let query = { name: name };
			
			conn.getDb().collection(_table).find(query).collation(
				{ locale: 'en', strength: 2 }
			  ).toArray(function(err, result) {
					
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}

			});

		});
	},

	getByNameMySQL : async function(name) {
		return new Promise(function(resolve, reject) {

			
			// return new Promise(function(resolve, reject) {

				connection.query('SELECT * FROM countries WHERE name="'+name+'"',function(err,res,fields) {
					if (err) {
						reject(err);
				   } else {
						resolve(res);
				   }
				});
				
			// });

		});
	},

	updateDetails: function(id,data) {

		
		let query = { _id: ObjectID(id) };
		
		conn.getDb().collection(_table).updateOne(query,{$set: data }, function(err, result) {
			if (err) {
				console.log('Error updating user: ' + err);
				// res.send({'error':'An error has occurred'});
			} else {
				console.log('' + result + ' document(s) updated');
				// res.send(result);
			}
		});

	},


};