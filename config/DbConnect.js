const MongoClient = require( 'mongodb' ).MongoClient;
const mongoose = require('mongoose');
const _variables = require( './variables' );

var _db, _connect, _dbEU;
console.log(_variables.mongoURL);
module.exports = {

  connectToServer: function( callback ) {
    MongoClient.connect( _variables.mongoURL ,  _variables.mongoOptions, function( err, client ) {
      _db  = client.db(_variables.mongoDB);
      return callback( err );
    } );
  },

  getDb: function() {
    return _db;
  },

  connectToServerEU: function( callback ) {
    MongoClient.connect( _variables.mongoURLEU ,  _variables.mongoOptions, function( err, client ) {
      _dbEU  = client.db(_variables.mongoDB);
      return callback( err );
    } );
  },

  getDbEU: function() {
    return _dbEU;
  }


};