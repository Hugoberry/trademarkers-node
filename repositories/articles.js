let _table = process.env.TBLEXT + "articles";

let conn = require('../config/DbConnect');

// DATABASE CONNECTION
const mysql = require('mysql');
const util = require('util');

const connection = mysql.createConnection({
    host     : process.env.DBHOST,
	user     : process.env.DBUSER,
	password : process.env.DBPASS,
	database : process.env.DBNAME
});

module.exports = {

	getAllArticles: async function ( searchTerm ) {

		return new Promise(function(resolve, reject) {

			let query = "SELECT post_name FROM tradewp_posts WHERE post_type='post' AND post_status='publish'"
			if (searchTerm) {
				query += "AND post_title like '%"+searchTerm+"%'"
			}

			query += " ORDER BY post_modified DESC"

			connection.query(query,function(err,res,fields) {
				if (err) {
					reject(err);
				} else {
						resolve(res);
				}
			});
		});

	},
	
	getArticles: async function ( searchTerm ) {

		return new Promise(function(resolve, reject) {

			let query = "SELECT * FROM tradewp_posts WHERE post_type='post' AND post_status='publish'"
			if (searchTerm) {
				query += "AND post_title like '%"+searchTerm+"%'"
			}

			query += " ORDER BY post_modified DESC limit 20"

			connection.query(query,function(err,res,fields) {
				if (err) {
					reject(err);
				} else {
						resolve(res);
				}
			});
		});

	},

	getArticleSlug: async function ( slug ) {

		return new Promise(function(resolve, reject) {
			connection.query("SELECT * FROM tradewp_posts WHERE post_type='post' AND post_status='publish' AND post_name=?", slug ,function(err,res,fields) {
				if (err) {
					reject(err);
			} else {
					resolve(res);
			}
			});
		});

	},


	fetchTmByUser: async function ( user_id, sort ) {

		return new Promise(function(resolve, reject) {

			let query = "";

			if (sort) {
				let sortBy = (sort == 'registered' ? "AND office_status = 'Registered'" : "AND office_status <> 'Registered'");

				query = `SELECT * 
							FROM trademarks 
							WHERE user_id = ${user_id}
							AND service = 'Trademark Registration'
							${sortBy}
						`;
			} else {
				console.log('tet');
				query = `SELECT * 
							FROM trademarks 
							WHERE user_id = '${user_id}'
							GROUP BY filing_number
						`;
			}

			connection.query(query,function(err,res,fields) {
				if (err) {
					reject(err);
			} else {
					resolve(res);
			}
			});
		});

	},

	fetchTmCertById: function ( trademark_id ) {

		return new Promise(function(resolve, reject) {
			connection.query('SELECT * FROM certificates WHERE trademark_id = ?',[trademark_id],function(err,res,fields) {
				if (err) {
					reject(err);
			} else {
					resolve(res);
			}
			});
		});

	},
}; 