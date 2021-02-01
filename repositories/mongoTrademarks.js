let _table = process.env.TBLEXT + "trademarks";
let conn = require('../config/DbConnect');
let ObjectID = require('mongodb').ObjectID;

let moment = require('moment');
const { toInteger } = require('lodash');


module.exports = {


	getAll : async function() {
		return new Promise(function(resolve, reject) {

			
			
			conn.getDb().collection(_table).find().limit(10).toArray(function(err, result) {
					
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}

			});

		});
	},



	getlimitData : async function($limit) {
		
		return new Promise(function(resolve, reject) {

			let query = { 
				$or : [
					{"status": "Published for Opposition"},
					{"status": "Notice of Abandonment"},
					{"status": "Under Examination"}
				],
				$or : [
					{ "lastCrawled" : {$gte : moment().subtract("2", "weeks").format("YYYY-MM-DD") } }
				]
				// "status": "Published for Opposition",
				// "noticeOfAllowanceDate" : { exists : true }
			};
			// console.log('here', _table);
			conn.getDb()
				.collection(_table)
				.find(query)
				.limit($limit)
				.sort( { "lastCrawled": 1 } )
				.toArray(function(err, result) {
					
					if (err) {
						reject(err);
					} else {
						resolve(result);
					}

				});

		});
	},

	getlimitDataByStatus : async function() {
		
		return new Promise(function(resolve, reject) {

			let query = { 
				$or : [
					{"status": "Published for Opposition"},
					{"status": "Notice of Abandonment"},
					{"status": "Under Examination"}
				],
				"noticeOfAllowanceDate" : { $exists : true }
				// $or : [
				// 	{ "lastCrawled" : {$gte : moment().subtract("2", "weeks").format("YYYY-MM-DD") } }
				// ]
				// "status": "Published for Opposition",
				// "noticeOfAllowanceDate" : { exists : true }
			};
			// console.log('here', _table);
			conn.getDb()
				.collection(_table)
				.find(query)
				.sort( { "noticeOfAllowanceDate": 1 } )
				.toArray(function(err, result) {
					
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

    }

	
	
};