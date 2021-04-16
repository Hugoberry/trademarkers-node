let _table = process.env.TBLEXT + "prices";
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

	getAll : async function() {
		return new Promise(function(resolve, reject) {

			conn.getDb().collection(_table).find().toArray(function(err, result) {
					
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}

			});

		});
	},

    getAllMysql : async function() {
        
        return new Promise(function(resolve, reject) {
			connection.query('SELECT * FROM prices',function(err,res,fields) {
				if (err) {
					reject(err);
			} else {
					resolve(res);
			}
			});
		});
        
	},

	put: function(data) {

        conn.getDb().collection(_table).insertOne(data, 
			function(err, res2) {
				if (err) throw err;
			}
		);

	},

	findPriceByCountry : async function(country_id, service_type) {
		return new Promise(function(resolve, reject) {

			let query = { 
				country_id: country_id ,
				service_type: service_type
			};

			let db = conn.getDb();
			
			db.collection(_table).find(query).collation(
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

	findPriceByCountryId : async function(country_id) {
		return new Promise(function(resolve, reject) {

			let query = { 
				country_id: country_id
			};

			let db = conn.getDb();
			
			db.collection(_table).find(query).toArray(function(err, result) {
					
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}

			});

		});
	},

};