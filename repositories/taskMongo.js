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

	putTask : async function(task) {
		return new Promise(function(resolve, reject) {


			// db.mongoConnection

			mongoConnection.collection("tasks").findOne({
				id: task.id
			}, 
			function(err, result) {
				if (err) {
					reject(err);
				} else {
					
					if (!result) {
						mongoConnection.collection("tasks").insertOne({
							...task
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