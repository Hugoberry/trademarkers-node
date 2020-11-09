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

	check : async function(user) {
		return new Promise(function(resolve, reject) {


			// db.mongoConnection

			mongoConnection.collection("users").findOne({
				id: user.id
			}, 
			function(err, result) {
				if (err) {
					reject(err);
				} else {
					
					if (!result) {
						mongoConnection.collection("users").insertOne({
							user
						}, 
						function(err, res2) {
							if (err) throw err;
							// res2.json(res2);
						});
					}

					resolve(result);
				}
			});


		});
	}

	
	
};