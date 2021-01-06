let _table = process.env.TBLEXT + "countries";
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

			conn.getDb().collection(_table).find().toArray(function(err, result) {
					
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}

			});

		});
	},
};