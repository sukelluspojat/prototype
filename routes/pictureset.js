var _ = require('underscore');
var async = require('async');
var q = require('q');

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
	function getRandomOrder() {
    var deferred = q.defer();
    var order;
		console.log('at getRandomOrder()');
		try {
      // deferred.resolve(
  			picturesDb.find({},{fields:{_id:1}},
          function(e,docs) {
  				      randomOrder = shuffle(
                  _.map(docs,
                    function(entry){
                      return entry['_id'];
                    }
                  )
                );
            deferred.resolve(randomOrder);
          }
        );
      // );
		}
		catch (err) {
		  console.log(err);
      deferred.reject("error");
		}
    return deferred.promise;


	}
	//--------------------------------------------


	exports.handleGetRequest = function(req, res) {
    // Handles get request, if need for pictures -> deliver them otherwise do something else
    try {
      randomPictures(req.query)
      .then(function(data) {
        console.log("JSON SEND");
        res.json({
          picture: 1,
          vacationList: 0,
          vacationInfo: 0,
          data: data
          });
      });
    }
    catch (err) {
      console.log(err);
    }
	}
  function randomPictures(query) {
    var deferred = q.defer();
    var x, queryParam, y;
    if (typeof query.randomIdOrder !== 'object') {
      queryParam = query.numberOfPictures;
      try {
        getRandomOrder()
        .then(function(par) {
          getRandomPicturesWithOrder(par, queryParam)
          .then(function(data) {
            deferred.resolve(data);
          });
        });
      }
      catch (err) {
        console.log(err);
      }
    }
    else {
      res.json(getRandomPicturesWithOrder(req.query.randomIdOrder, req.query.numberOfPictures));
    }
    return deferred.promise;
  }
	//--------------------------------------------
	// Get 'req.query.numberOfPictures' random picturesDb from DB.
	function getRandomPicturesWithOrder(order, n) {
    var deferred = q.defer();
		// var picturesDb = db.get('Picture');
		console.log('at getRandomPicturesWithOrder');
		var ret = [];
		// pick smaller: n, order.length
		// (run out of pics before enough)
		var index = 0;
		var pickLimit = Math.min(n, order.length);
  	async.whilst(
      function() {
  			return index < pickLimit;
  		},
  		function(next) {
  			// get DB document with first '_id' from array 'order'
  			// append it somewhere (array?)
  			// remove first _id from order
  			try {
  				picturesDb.findOne({_id: order.pop() },{},
  				function(err, document) {
  					ret.push(document);
  				})
            .then(
              function() {
                index = index + 1;
                next();
              }
            )
  			}
  			catch (err) {
  				console.log(err);
  			}
  		},
  		function(err) {
        deferred.resolve(ret);
  		}
    );
    return deferred.promise;

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
