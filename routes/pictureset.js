var _ = require('underscore');
var async = require('async');
var q = require('q');
var C_Map = require("collections/map"); //js has standard map support 'Map()' on some platforms, this is different.

//------------------------------------------
//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/array/shuffle [v1.0]
function shuffle(o){ //v1.0
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};
//------------------------------------------


module.exports = function(db) {
	var exports = {}; //some js specific trick

	var picturesDb = db.get('Picture'); //DB collection for pictures
  var holidaysDb = db.get('Holiday'); //DB collection for holiday packages
  
  var order = [];
  var scoresMap;
	//--------------------------------------------
	// Results in something like:
	// Array[object]
	// = [ 54655bf459ae3eafbced8a50,
		  // 5465be67a4c80c8d8ece26e8,
		  // 54655ca4c5b739c41127fe5a,
		  // 5465be67a4c80c8d8ece26ea,
		  // 54655bf659ae3eafbced8a51,
		  // 5465be67a4c80c8d8ece26e7,
		  // 5465be67a4c80c8d8ece26e9,
		  // 5465be69a4c80c8d8ece26eb,
		  // 54655bf859ae3eafbced8a52 ]
	// Get all picture '_id':s from DB and shuffle them. Order returned.
	// GOAL: Order is used to save user-specific random order and to save
	// which pictures have not been asked.
	function getRandomOrder() {
    var deferred = q.defer();
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
            order = randomOrder;
            console.log(order);
            deferred.resolve(randomOrder);
          }
        );
      // );
		}
		catch (err) {
		  console.log(err);
      deferred.reject("error");
		}
    
    //run other tests on currently unused parts of the program:
    getInitializedHolidays().then(function(re) {
      console.log("-----------TEST: getInitializedHolidays----------");
      console.log(re);
    });
    // ^^ comment out until here ^^
    
    return deferred.promise;
	}
	//--------------------------------------------


  
  //--------------------------------------------
  // Used by other files. Returns picture data with .json.
  // req.query.numberOfPictures = number of wanted pictures
  //
  // req.query.randomIdOrder = (optional -> else put something non-object) array of shuffled DB '_id':s for pictures
  // GOAL: (saves user-specific random order and saves which pictures have not been asked)
	//
  // Other parameters?
  exports.handleGetRequest = function(req, res) {
    // Handles get request, if need for pictures -> deliver them otherwise do something else
    try {
      randomPictures(req.query)
      .then(function(data) {
        console.log("JSON SEND");
        res.json({
          picture: 1, //means what??
          vacationList: 0, //means what??
          vacationInfo: 0, //means what??
          data: data //HERE: DB entries for req.query.numberOfPictures different pictures
          });
      });
    }
    catch (err) {
      console.log(err);
    }
	}
  //--------------------------------------------
  
  
  
  //--------------------------------------------
  // Collects requested random pictures 
  function randomPictures(query) {
    var deferred = q.defer();
    var queryNumberOfPictures;
    
    if (typeof query.randomIdOrder !== 'object') {
      queryNumberOfPictures = query.numberOfPictures;
      try {
        getRandomOrder()
        .then(function(order) {
          getRandomPicturesWithOrder(order, queryNumberOfPictures)
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
  
  
  
	//--------------------------------------------
	// Get 'n' random picturesDb from DB. 
  // Random selection with parameter 'order' that is
  // a shuffled list of DB '_id':s for all available
  // pictures that have not been asked.
	function getRandomPicturesWithOrder(order, n) {
    var deferred = q.defer();
    
		console.log('at getRandomPicturesWithOrder');
		var ret = [];
		
    var index = 0;
		
    // pick smaller: n, order.length
		// (run out of pictures before found enough)
		var pickLimit = Math.min(n, order.length);
  	
    async.whilst(
      function() {
  			return index < pickLimit;
  		},
  		function(next) {
  			// Get DB document with first '_id' from array 'order'.
  			// Append it to array 'ret'.
  			// Remove first _id from order. (.pop() used)
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
	// Results in something like:
	// Array[object]
	// = [ [54655bf459ae3eafbced8a50, 25],
		  // [5465be67a4c80c8d8ece26e8, 15],
		  // [54655ca4c5b739c41127fe5a, 12]]
	// Get query.n best holiday packages according to answers
  // query.accepted. (and query.rejected)? Returns an array of
  // ['_id', points] pairs that is used to save holiday 
  // packages that are still in contention and their scores.
	function bestAlternatives(query) {
    var deferred = q.defer();
    var queryN = query.n;
    var queryAccepted = query.accepted;
    var queryRejected = query.rejected;

    try {
      getInitializedHolidays()
      .then(function(holidayMap) {
        getBestScoredAlternatives(holidayMap, queryN, queryAccepted, queryRejected)
        .then(function(data) {
          deferred.resolve(data);
        });
      });
    }
    catch (err) {
      console.log(err);
    }
    return deferred.promise;
	}
	//--------------------------------------------

  
  //--------------------------------------------
  // Initializes and returns a Map of groups of 
  // holiday _id:s, tagsMultipliers and point amounts. 
  function getInitializedHolidays() {
    
    var deferred = q.defer();
    console.log('at getInitializedHolidays()');
    
    try {
      // deferred.resolve(
  			holidaysDb.find({},{fields:{_id: 1, tagsMultipliers: 1}},
          function(e,docs) {
            idScorePairs = 
              _.map(docs,
                function(entry){
                  return [entry['_id'], entry['tagsMultipliers'], 0];
                }
              );
            //console.log(idScorePairs);
            deferred.resolve(idScorePairs);
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
  
  
  //--------------------------------------------
  // Returns an array of n [_id, tagsMultipliers, score] groups that have highest scores.
  // function getBestScoredAlternatives(holidayScores, n, accepted, rejected) {
  
    // var deferred = q.defer();
    // console.log('at getBestScoredAlternatives');
    
    // try {
      // _.foreach(holidayScores, 
        // function(entry){
          // _.foreach(entry[1], function(tagMultipPair) {
            // accCount = 
          // })
          
        // })
      // });
    // }
    // catch(err) {
		  // console.log(err);
      // deferred.reject("error");
		// }
    
    // return deferred.promise;
  // }
  //--------------------------------------------
  
  
  //@TODO: MAKE THIS WORK WITH REST OF THE PROGRAM:
  // MISSING: DATA TRANSFER, ASYNC PROBLEMS
	//--------------------------------------------
	// Get 'req.query.numberOfPictures' random picturesDb from DB
	// so that each picture has at least one tag from array 'req.query.allowedTags'.
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

// http://stackoverflow.com/questions/12629692/querying-an-array-of-arrays-in-mongodb