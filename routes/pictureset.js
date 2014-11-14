var _ = require('underscore');
var async = require('async');

//------------------------------------------
//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/array/shuffle [v1.0]
function shuffle(o){ //v1.0
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};
//------------------------------------------


module.exports = function(db) {
	var exports = {};
	var pictures = db.get('Picture');
	
	
	//--------------------------------------------
	// res.randomIdOrder: Array[object]
	// Get all picture '_id':s from DB and shuffle them. Order to res.
	exports.initRandomPictures = function(req, res) {
		console.log('at initRandomPictures');
		pictures.find({},{fields:{_id:1}}, function(e,docs) {
			res.send({randomIdOrder: shuffle(_.map(docs, function(entry){ return entry['_id']; })) });
		});
	}
	//--------------------------------------------
	
	
	//--------------------------------------------
	// Get 'req.query.numberOfPictures' random pictures from DB.
	exports.getRandomPictures = function(req, res) {
		console.log('at getRandomPictures');
		n = req.query.numberOfPictures;
		order = req.query.randomIdOrder;
		var ret = [];
		// DO STUFF
		
		// pick smaller: n, order.length
		
		var index = 0;
		var pickLimit = Math.min(n, order.length);

		async.whilst(function() {
			return index < pickLimit;
		},
		function(next) {
			// get DB document with first '_id' from array 'order'
			// append it somewhere (array?)
			// remove first _id from order
			
			pictures.findOne({_id: order.pop()},{}, 
				function(err, document) {
					ret.push(document);
					//console.log(document);
				});
			
			index = index + 1;
			next();
		},
		function(err) {
			res.send({documentArrayJson: ret, randomIdOrder: order});
		});
	}
	//--------------------------------------------

	
	//--------------------------------------------
	// Get 'req.query.numberOfPictures' random pictures from DB
	// so that each picture has at least one tag from array 'allowedTags'.
	exports.getRandomPicturesWithAllowedTags = function(req, res) {
		console.log('at getRandomPictures');
		n = req.query.numberOfPictures;
		order = req.query.randomIdOrder;
		tags = req.query.allowedTags;
		
		// DO STUFF
		// like getRandomPictures, but if first _id from order has no tag from tags just remove it and continue with next.
		// other note: cannot pick smaller of order.length and n to while loop end limit
		// according to current algorithm, we never return back to pictures that have once been skipped.
		
		//res.json();
	}		
	//--------------------------------------------
	
	
	return exports;
};



//http://expressjs.com/api.html#req.param