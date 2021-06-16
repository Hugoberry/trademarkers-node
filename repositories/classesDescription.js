let _table = process.env.TBLEXT + "class_descriptions";
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
			connection.query('SELECT * FROM class_descriptions',function(err,res,fields) {
				if (err) {
					reject(err);
			} else {
					resolve(res);
			}
			});
		});
        
	},

	getAllSearch : async function(searchTerm) {
        
        return new Promise(function(resolve, reject) {
			connection.query('SELECT * FROM class_descriptions where description like %?%',searchTerm,function(err,res,fields) {
				if (err) {
					reject(err);
			} else {
					resolve(res);
			}
			});
		});
        
	},
};