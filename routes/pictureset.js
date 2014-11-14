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

	var picturesDb = db.get('Picture');
	//--------------------------------------------
	// Results in something like:
	// res.randomIdOrder: Array[object]
	// =   [ 54655bf459ae3eafbced8a50,
		  // 5465be67a4c80c8d8ece26e8,
		  // 54655ca4c5b739c41127fe5a,
		  // 5465be67a4c80c8d8ece26ea,
		  // 54655bf659ae3eafbced8a51,
		  // 5465be67a4c80c8d8ece26e7,
		  // 5465be67a4c80c8d8ece26e9,
		  // 5465be69a4c80c8d8ece26eb,
		  // 54655bf859ae3eafbced8a52 ]
	// Get all picture '_id':s from DB and shuffle them. Order to res.
	function initRandomPictures(req, res) {
		// var picturesDb = db.get('Picture');

		console.log('at initRandomPictures');
    try {
      picturesDb.find({},{fields:{_id:1}}, function(e,docs) {
        res.send({randomIdOrder: shuffle(_.map(docs, function(entry){ return entry['_id']; })), numberOfPictures: req.query.numberOfPictures});
      });
    }
    catch (err) {
      console.log(err);
    }


	}
	//--------------------------------------------


	exports.getRandomPictures = function(req, res) {
		if (typeof req.query.randomIdOrder !== 'object') {
      console.log(req.query);
			exports.getRandomPicturesWithOrder(initRandomPictures(req, res), res);
		}
		else {
			exports.getRandomPicturesWithOrder(req, res);
		}
	}



	//--------------------------------------------
	// Get 'req.query.numberOfPictures' random picturesDb from DB.
	exports.getRandomPicturesWithOrder = function(req, res) {
		// var picturesDb = db.get('Picture');

		console.log('at getRandomPicturesWithOrder');
    n = req.query.numberOfPictures;
		order = req.query.randomIdOrder;
    console.log(order);
		var ret = [];
		// pick smaller: n, order.length
		// (run out of pics before enough)
		var index = 0;
		var pickLimit = Math.min(n, order.length);

		async.whilst(function() {
			return index < pickLimit;
		},
		function(next) {
			// get DB document with first '_id' from array 'order'
			// append it somewhere (array?)
			// remove first _id from order
      try {
        picturesDb.findOne({_id: order.pop()},{},
          function(err, document) {
            ret.push(document);
            //console.log(document);
          });

        index = index + 1;
        next();
      }
      catch (err) {
        console.log(err);
      }

		},
		function(err) {
			res.send({documentArrayJson: ret, randomIdOrder: order});
		});
	}
	//--------------------------------------------


	//--------------------------------------------
	// Get 'req.query.numberOfPictures' random picturesDb from DB
	// so that each picture has at least one tag from array 'allowedTags'.
	exports.getRandomPicturesWithAllowedTags = function(req, res) {
		// var picturesDb = db.get('Picture');

		console.log('at getRandomPicturesWithAllowedTags');
		n = req.query.numberOfPictures;
		order = req.query.randomIdOrder;
		tags = req.query.allowedTags;

		// DO STUFF
		// like getRandomPictures, but if first _id from order has no tag from tags just remove it and continue with next.
		// other note: cannot pick smaller of order.length and n to while loop end limit
		// according to current algorithm, we never return back to picturesDb that have once been skipped. -> Just discard from 'order' array.

		var ret = [];
		// pick smaller: n, order.length
		// (run out of pics before enough)
		var indexCount = 0;
		var foundCount = 0;

		async.whilst(function() {
			return indexCount < order.length && foundCount < n;
		},
		function(next) {
			// get DB document with first '_id' from array 'order'
			// append it somewhere (array?)
			// remove first _id from order
      try {
        picturesDb.findOne({_id: order.pop()},{},
          function(err, document) {
            if(_.intersection(tags, document.tags).length > 0) {
              //if tag lists have non-empty intersection, then:
              ret.push(document);
              foundCount = foundCount + 1;
            }
            //console.log(document);
          });

        indexCount = indexCount + 1;
        next();
      }
      catch (err) {
        console.log(err);
      }

		},
		function(err) {
			res.send({documentArrayJson: ret, randomIdOrder: order});
		});
	}
	//--------------------------------------------


	return exports;
};



//http://expressjs.com/api.html#req.param
