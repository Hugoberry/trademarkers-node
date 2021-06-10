let _table = process.env.TBLEXT + "articles";

let conn = require('../config/DbConnect');
let ObjectID = require('mongodb').ObjectID;
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

	getAllArticles: async function ( ) {

		return new Promise(function(resolve, reject) {

			let query = "SELECT post_name FROM tradewp_posts WHERE post_type='post' AND post_status='publish'"
			// if (searchTerm) {
			// 	query += "AND post_title like '%"+searchTerm+"%'"
			// }

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

	getTotalCount : async function( ) {
		return new Promise(function(resolve, reject) {

			let query = {"status" : "Published"};

			let db = conn.getDb();
			
			db.collection(_table)
				.find(query)
				.count(function(err, result) {
					
					if (err) {
						reject(err);
					} else {
						resolve(result);
					}
	
				});

		});
	},

	getAllArticlesPaginated: async function ( perPage, offset ) {

		return new Promise(function(resolve, reject) {

			let query = "SELECT post_name, post_title, post_date, post_content FROM tradewp_posts WHERE post_type='post' AND post_status='publish'"

			query += " ORDER BY post_modified DESC"
			query += " LIMIT " + perPage
			query += " OFFSET " + offset

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

	getAllArticlesPaginatedM : async function( perPage, offset ) {
		return new Promise(function(resolve, reject) {

			let query = {"status" : "Published"};
			let fields = { content: 0 };

			let db = conn.getDb();
			
			db.collection(_table)
				.find(query)
				.skip(offset)
				.limit(perPage)
				.sort({"created_at": -1})
				.toArray(function(err, result) {
					
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}

			});

		});
	},

	getArticlesM : async function( searchTerm ) {
		return new Promise(function(resolve, reject) {

			let query = {"title" : {$regex : ".*"+searchTerm+".*", $options: "si" } };

			let db = conn.getDb();
			
			db.collection(_table)
			.find(query)
			.toArray(function(err, result) {
					
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}

			});

		});
	},

	getArticleSlugM: async function ( slug ) {

		return new Promise(function(resolve, reject) {

			let query = {"slug" : slug };

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

	getById : async function(id) {
		return new Promise(function(resolve, reject) {

			let query = { _id: ObjectID(id) };

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

	storeArticle : async function(article) {
		return new Promise(function(resolve, reject) {


			// let db = conn.getDb();

			conn.getDb().collection(_table).findOne({
				slug: article.slug
			}, 
			function(err, result) {
				if (err) {
					reject(err);
				} else {
					
					if (!result) {
						conn.getDb().collection(_table).insertOne(article, 
						function(err, res2) {
							if (err) throw err;

							if (res2) {
								// mailService.notifyNewAccount(user)
						        resolve(res2);
							}
						});
					} else {
						resolve(result);

					}

				}
			});


		});
	},

	update: async function(id,data) {

        let query = { _id: ObjectID(id) };

		return new Promise(function(resolve, reject) { 

			conn.getDb().collection(_table).updateOne(query,{$set: data }, function(err, result) {
				if (err) {
					// console.log('Error updating user: ' + err);
					// res.send({'error':'An error has occurred'});
					reject(err)
				} else {
					// console.log('' + result + ' document(s) updated');
					// res.send(result);
					resolve(result)
				}
			});

		});

    }


}; 