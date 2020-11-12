let _table = process.env.TBLEXT + "activity_logs";

// MONGO : DATABASE CONNECTION
const mongoose = require('mongoose');
const mongoDb = process.env.MongoURILOCAL;
const mongoDbOptions = { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
};

// DB Connect
const mongoConnection = mongoose.createConnection(mongoDb, mongoDbOptions);

module.exports = {

	addLogs : async function(obj) {
		return new Promise(function(resolve, reject) {



			mongoConnection.collection(_table).findOne({
				id: obj.id
			}, 
			function(err, result) {
				if (err) {
					reject(err);
				} else {
					
					if (!result) {
						mongoConnection.collection(_table).insertOne({
							obj
						}, 
						function(err, res2) {
							if (err) throw err;
						});
					}

					resolve(result);
				}
			});

		});
	},
};