let _table = process.env.TBLEXT + "continents";
let conn = require('../config/DbConnect');

var ObjectID = require('mongodb').ObjectID;

// dirty connection MYSQL
const mysql = require('mysql');
const connection = mysql.createConnection({
    host     : process.env.DBHOST,
	user     : process.env.DBUSER,
	password : process.env.DBPASS,
	database : process.env.DBNAME
});

// console.log("host", process.env.DBHOST);
module.exports = {

    getContinents : async function() {
		return new Promise(function(resolve, reject) {

            var query = {};
            // query = { name: /^h/ };

            
            conn.getDb().collection(_table).find(query).toArray(
			function(err, result) {
				if (err) {
					reject(err);
				} else {

					resolve(result);
				}
			});

		});
    },

    getContinentAbbr : async function(abbr) {
		return new Promise(function(resolve, reject) {

            var query = { abbr: abbr };

            
            conn.getDb().collection(_table).find(query).collation(
				{ locale: 'en', strength: 2 }
			  ).toArray(
			function(err, result) {
				if (err) {
					reject(err);
				} else {

					resolve(result);
				}
			});

		});
	},
	
	getContinentID : async function(id) {
		return new Promise(function(resolve, reject) {

            var query = { id: id };

            
            conn.getDb().collection(_table).find(query).collation(
				{ locale: 'en', strength: 2 }
			  ).toArray(
			function(err, result) {
				if (err) {
					reject(err);
				} else {

					resolve(result);
				}
			});

		});
    },
    
    getContinentsMysql: async function(){
        return new Promise(function(resolve, reject) {

            connection.query('SELECT * FROM continents',function(err,res,fields) {
				if (err) {
					reject(err);
			   } else {
					resolve(res);
			   }
            });
            
        });
    },

    getCountryPerContinentMysql: async function(id){
        return new Promise(function(resolve, reject) {

            connection.query('SELECT * FROM countries WHERE continent_id=?',[id],function(err,res,fields) {
				if (err) {
					reject(err);
			   } else {
					resolve(res);
			   }
            });
            
        });
    },

    // PUT 
    putContinents: function(continent) {

        conn.getDb().collection(_table).findOne({
            id: continent.id
        }, 
        function(err, result) {
            if (err) { throw err
               
            } else {
                
                if (!result) {
                    conn.getDb().collection(_table).insertOne({
                        ...continent
                    }, 
                    function(err, res2) {
                        if (err) throw err;
                    });
                }
            }
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