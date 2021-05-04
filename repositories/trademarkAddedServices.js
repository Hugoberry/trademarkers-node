let _table = process.env.TBLEXT + "trademarksAddedServices";
let conn = require('../config/DbConnect');
let ObjectID = require('mongodb').ObjectID;

let moment = require('moment');
const { toInteger } = require('lodash');


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

	getByTrademarkId : async function(id) {
		return new Promise(function(resolve, reject) {

			let query = { trademarkId: id };
			
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

		return new Promise(function(resolve, reject) {
            // console.log("id", id);
            let query = { _id: ObjectID(id) };
            // console.log("query", query._id);
            conn.getDb().collection(_table).updateOne(query,{$set: data }, function(err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result)
                    // res.send(result);
                }
            });
            
        });

	},
	
	put: function(data) {

		return new Promise(function(resolve, reject) {

        conn.getDb().collection(_table).insertOne(data, 
			function(err, res) {
				if (err) {
					reject(err);
				} else {
					resolve(res)
				}
			}
		);

		})

    },
    
    remove: async function(id) {

		return new Promise(function(resolve, reject) {

			let query = { _id: ObjectID(id) };

			conn.getDb().collection(_table).deleteOne(query, function(err, result) {
				if (result) {
					console.log('ok');
					resolve(result)
				} else {
					console.log('err', err.message);
					reject(err);
				}
			});
		});

    }

	
	
};