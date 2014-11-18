var _ = require('underscore');
var async = require('async');
var q = require('q');
//var C_Map = require("collections/map"); //js has standard map support 'Map()' on some platforms, this is different.

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
  
  
  var negMultip = 0.5; // used to make rejections to have less effect on scores
  
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
            deferred.resolve(randomOrder);
          }
        );
		}
		catch (err) {
		  console.log(err);
      deferred.reject("error");
		}
    
    //run other tests on currently unused parts of the program:
    // getInitializedHolidays().then(function(re) {
      // console.log("-----------TEST: getInitializedHolidays----------");
      // //console.log(re);
      // getBestScoredAlternatives(re, 5, ['beach', 'bar', 'reef'], ['kids', 'tropical', 'friends']);
    // });
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
  			holidaysDb.find({},{fields:{_id: 1, tags: 1, multipliers: 1}},
          function(e,docs) {
            idScorePairs = 
              _.map(docs,
                function(entry){
                  return [entry['_id'], _.zip(entry['tags'], entry['multipliers']), 0];
                }
              );
            _.forEach(idScorePairs, function(asd) {console.log(asd);});
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
  // Returns an array of n [_id, [[tag, multiplier] pairs], score] groups that have highest scores.
  function getBestScoredAlternatives(holidayScores, n, accepted, rejected) {
  
    var deferred = q.defer();
    console.log('at getBestScoredAlternatives');
    
    try {
      //for each holiday, for each tag in holiday: 
      // calculate points for current tag
      _.forEach(holidayScores, 
        function(entry){
          _.forEach(entry[1], function(tagMultipPair) {
            // each [tag, multiplier] pair
            // count tag from accepted
            accCount = _.filter(accepted, function(tag){ return tag == tagMultipPair[0]; }).length;
            // increase points
            entry[2] = entry[2] + accCount * tagMultipPair[1];
            // count tag from rejected
            rejCount = _.filter(rejected, function(tag){ return tag == tagMultipPair[0]; }).length;
            // decrease points
            entry[2] = entry[2] - rejCount * tagMultipPair[1] * negMultip;
            
          });
        }
      );
      
      holidayScores.sort(function(a, b){return b[2]-a[2]});
      
      temp = holidayScores.slice(0, Math.min(n, holidayScores.length));

      deferred.resolve(temp);
    }
    catch(err) {
		  console.log(err);
      deferred.reject("error");
		}
    
    return deferred.promise;
  }
  //--------------------------------------------
  
  
  function getHolidaysForIds(ids) {
    var deferred = q.defer();
    
    console.log('at getHolidaysForIds');
    
    deferred.resolve(_.map(ids, function(id) {holidaysDb.findOne({_id: id}, {});}));
    
    return deferred.promise;
	}


	return exports;
};
