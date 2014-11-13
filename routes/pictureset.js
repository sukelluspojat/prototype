// var db = req.db;
// var pictures = db.get('Picture'); //collection name 'Picture'
// var pictureIDs = pictures.find({}, {fields:['_id']}).toArray(); //test this firstChild
// console.log('unshuffled picture IDs:');
// console.log(pictureIDs);


// var usedPictures = []; //already asked from user ('_id')

//shuffle pictureIDs to get a random order
module.exports = function(db) {
	var exports = {};

	exports.getRandomPictures = function(req, res) {
		//return pictures.find({}, {limit:10}).toArray();
		console.log('test');

		// http://stackoverflow.com/questions/23642510/how-to-send-mongodb-query-result-as-a-json-response-using-express
		////--------------------------------------
		// Random: 
		// difficult options:
		//// http://cookbook.mongodb.org/patterns/random-attribute/
		//// http://eric.lubow.org/2010/databases/mongodb/getting-a-random-record-from-a-mongodb-collection/
		// easy but inefficient option:
		//// http://stackoverflow.com/questions/2824157/random-record-from-mongodb/5517206
		////--------------------------------------
		// http://stackoverflow.com/questions/8033366/how-to-get-string-value-inside-a-mongodb-document
	}

	return exports;
};
