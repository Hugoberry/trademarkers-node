// DATABASE CONNECTION
var db = require('../config/database');

// console.log("host", process.env.DBHOST);
module.exports = {

    getContinents: function( id ) {

        return  'SELECT c.name as contName, cc.* FROM continents c JOIN countries cc on c.id=cc.continent_id order by continent_id DESC';

    }
};