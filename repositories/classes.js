let _table = process.env.TBLEXT + "classes";
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
			connection.query('SELECT * FROM trademark_classes',function(err,res,fields) {
				if (err) {
					reject(err);
			} else {
					resolve(res);
			}
			});
		});
        
	},
};