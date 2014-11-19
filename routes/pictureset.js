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
//^^^^^^^^^^


module.exports = function(db) {
	var exports = {}; //some js specific trick

	var picturesDb = db.get('Picture'); //DB collection for pictures
  var holidaysDb = db.get('Holiday'); //DB collection for holiday packages


  var negMultip = 0.5; // used to make rejections to have less effect on scores

  var order = [];
  var scores = [];

  //--------------------------------------------
  // Used by other files. Returns picture data with .json.
  // req.query.numberOfPictures = number of wanted pictures
  //
  exports.handleGetRequest = function(req, res) {
    // Handles get request, if need for pictures -> deliver them otherwise do something else
    try {
      //tests();
      initialRandomPictures(req.query)
      .then(function(data) {
        console.log("JSON SEND");
        res.json({
          picture: 1, //means what??
          vacationInfo: 0, //means what??
          data: data[0] //HERE: DB entries for req.query.numberOfPictures different pictures
          });
      });
    }
    catch (err) {
      console.log(err);
    }
	}


  //--------------------------------------------
  // Used by other files.
  //
  exports.handleGetRequestNew = function(req, res) {
    if(req.query.type == "InitialPictures") {
      //--- needs:
      //-req.query.numberOfPictures: Wanted amount of returned DB entries.
      //--- should return:
      //-data: DB entries for 'numberOfPictures' random pictures
      //-randomIdOrder: Tells which pictures are still unasked and
      //gives user-specific randomized order of pictures.
      try {
        initialRandomPictures(req.query)
        .then(function(returned) {
          console.log("JSON SEND 'InitialPictures'");
          res.json({
            picture: 1,
            vacationInfo: 0,
            data: returned[0],
            randomIdOrder: returned[1]
          });
        });
      }
      catch (err) {
        console.log(err);
      }
    }
    else if(req.query.type == "MorePictures") {
      //--- needs:
      //-req.query.numberOfPictures: Wanted amount of returned DB entries.
      //-req.query.randomIdOrder: Tells which pictures are still unasked and
      //gives user-specific randomized order of pictures.
      //-req.query.accepted: 1D array of accepted tags for previous picture set only
      //-req.query.rejected: 1D array of rejected tags for previous picture set only
      //-req.query.numberInContention: Number of holiday packages kept in contention
      //for this set of pictures.
      //--- should return:
      //-data: DB entries for 'numberOfPictures' random pictures
      //-scores: Points after previous pictures for 'numberInContention' best
      //holiday packages.
      //-tags: List of most effective tags for holiday packages still in contention. Try to pick one of these when asking user.
      try {
        moreRandomPictures(req.query)
        .then(function(returned) {
          console.log("JSON SEND 'MorePictures'");
          res.json({
            picture: 1,
            vacationInfo: 0,
            data: returned[0],
            scores: returned[1],
            tags: returned[2]
          });
        });
      }
      catch (err) {
        console.log(err);
      }
    }
    else if(req.query.type == "BestHolidays") {
      //--- needs:
      //-req.query.accepted: 1D array of accepted tags for previous picture set only
      //-req.query.rejected: 1D array of rejected tags for previous picture set only
      //-req.query.numberReturned: number of returned packages
      //-req.query.scores: Points after previous pictures for best holiday packages
      //--- should return:
      //-data: DB entries for 'numberReturned' best holiday packages, ordered highest score first
      try {
        bestHolidays(req.query)
        .then(function(returned) {
          console.log("JSON SEND 'BestHolidays'");
          res.json({
            picture: 0,
            vacationInfo: 1,
            data: returned[0]
          });
        });
      }
      catch (err) {
        console.log(err);
      }
    }
    else {
      console.log("ERR: Unknown request type.");
    }
	}


	//--------------------------------------------
	// Results in something like:
	// Array[object]
	// = [ 54655bf459ae3eafbced8a50,
		  // 5465be69a4c80c8d8ece26eb,
		  // 54655bf859ae3eafbced8a52 ]
	// Get all picture '_id':s from DB and shuffle them. Order returned.
	// GOAL: Order is used to save user-specific random order and to save
	// which pictures have not been asked.
	function getRandomOrder() {
    var deferred = q.defer();
		console.log('at getRandomOrder()');

		try {
      picturesDb.find({},{fields:{_id:1}}, function(e,docs) {
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

    return deferred.promise;
	}


  //--------------------------------------------
  // Collects requested random pictures
  function initialRandomPictures(query) {
    var deferred = q.defer();

    try {
      getRandomOrder()
      .then(function(order) {
        getRandomPicturesWithOrder(order, query.numberOfPictures)
        .then(function(data) {
          deferred.resolve([data, order]);
        });
      });
    }
    catch (err) {
      console.log(err);
    }

    return deferred.promise;
  }


  //--------------------------------------------
  // Collects requested another set of random pictures
  // and counts scores for answers of the previous picture set
  function moreRandomPictures(query) {
    var deferred = q.defer();

    try {
      getInitializedHolidays()
      .then(function(scores) { //init scores
        getBestScoredAlternatives(scores, query.numberReturned, query.accepted,
          query.rejected) //n best scores
        .then(function(bestScores) {
          getTagList(bestScores)
          .then(function(tagList) {
            getRandomPicturesWithOrderAndTagList(order, tagList, n)
            .then(function(data) {
              deferred.resolve([data, bestScores, tagList]);
            });
          });
        });
      });
    }
    catch (err) {
      console.log(err);
    }

    return deferred.promise;
  }


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
	// Get 'n' random picturesDb from DB.
  // Random selection with parameter 'order' that is
  // a shuffled list of DB '_id':s for all available
  // pictures that have not been asked.
	function getRandomPicturesWithOrderAndTagList(order, tagList, n) {
    var deferred = q.defer();

		console.log('at getRandomPicturesWithOrderAndTagList');
		var ret = [];

    var index = 0;
		var found = 0;
    // pick smaller: n, order.length
		// (run out of pictures before found enough)

    async.whilst(
      function() {
  			return index < order.length && found < n;
  		},
  		function(next) {
  			// Get DB document with first '_id' from array 'order'.
  			// Append it to array 'ret'.
  			// Remove first _id from order. (.pop() used)
  			try {
  				picturesDb.findOne({_id: order.pop() },{},
  				function(err, document) {
            if (_.intersection(tagList, document.tags).length > 0) {
              ret.push(document);
              found = found + 1;
            }
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
  // Initializes and returns a Map of groups of
  // holiday _id:s, tagsMultipliers and point amounts.
  function getInitializedHolidays() {

    var deferred = q.defer();
    console.log('at getInitializedHolidays()');

    try {
      // deferred.resolve(
  			holidaysDb.find({},{fields:{_id: 1, tags: 1, multipliers: 1}},
          function(e,docs) {
            scores =
              _.map(docs,
                function(entry){
                  return [entry['_id'], _.zip(entry['tags'], entry['multipliers']), 0];
                }
              );
            _.forEach(scores, function(asd) {console.log(asd);});
            deferred.resolve(scores);
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
  // Returns an array of n [_id, [[tag, multiplier] pairs], score] groups that
  // have highest scores.
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
            accCount = _.filter(accepted, function(tag){
              return tag == tagMultipPair[0];
            }).length;
            // increase points
            entry[2] = entry[2] + accCount * tagMultipPair[1];
            // count tag from rejected
            rejCount = _.filter(rejected, function(tag){
              return tag == tagMultipPair[0];
            }).length;
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



  function bestHolidays(query) {
    var deferred = q.defer();

    try {
      getBestScoredAlternatives(scores, query.numberReturned, query.accepted,
        query.rejected) //n best scores
      .then(function(bestScores) {
        //bestScores = [_id, [[tag, multiplier] pairs], score]
        getHolidaysForIds(_.map(bestScores, function(tuple) {
          return tuple[0];
        }))
        .then(function(data) {
          deferred.resolve([data]); //as an array for symmetry with others
        });
      });
    }
    catch (err) {
      console.log(err);
    }

    return deferred.promise;
  }


  function getHolidaysForIds(ids) {
    var deferred = q.defer();

    console.log('at getHolidaysForIds');

    deferred.resolve(_.map(ids, function(id) {holidaysDb.findOne({_id: id}, {});}));

    return deferred.promise;
	}


  //List of most efficient tags for holiday packages still in contention
  function getTagList(bestScores) {
    //[_id, [[tag, multiplier] pairs], score]
    var tagsForHoliday = _.map(bestScores, function(tuple) {
      return _.map(tuple[1], function(tagMultipPair) {
        return tagMultipPair[0];
      });
    });

    return _.difference(_.union(tagsForHoliday), _.intersection(tagsForHoliday));
  }

  function tests() {
    var local_order;
    var local_scores;

    try {
      initialRandomPictures({numberOfPictures: 10})
      .then(function(returned) {
        var deferred = q.defer();
        console.log("***TEST: 'InitialPictures'");
        console.log("***pictureData");
        console.log(returned[0]);
        console.log("***randomIdOrder");
        local_order = returned[1];
        console.log(local_order);
        deferred.resolve(local_order);
        return deferred.promise;
      }).then(function(order) {
        moreRandomPictures({numberOfPictures: 5, randomIdOrder: local_order, accepted: ['beach', 'bar', 'reef'], rejected: ['kids', 'tropical', 'friends'], numberInContention: 5})
        .then(function(returned) {
          var deferred = q.defer();
          console.log("***TEST: 'MorePictures'");
          console.log("***pictureData");
          console.log(returned[0]);
          console.log("***scores");
          local_scores = returned[1]
          console.log(local_scores);
          console.log("***effectiveTags");
          console.log(returned[2]);
          deferred.resolve(local_scores);
          return deferred.promise;
        }).then(function(ret_scores) {
          bestHolidays({accepted: ['beach', 'bar'], rejected: ['tropical', 'friends'], scores: local_scores, numberReturned: 3})
          }).then(function(returned) {
            var deferred = q.defer();
            console.log("***TEST: 'BestHolidays'");
            console.log("***holidayData");
            console.log(returned[0]);
            deferred.resolve(local_scores);
            return deferred.promise;
          })
        });
    }
    catch (err) {
      console.log(err);
    }
	}



	return exports;
};
