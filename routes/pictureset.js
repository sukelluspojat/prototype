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






  //--------------------------------------------
  // Used by other files. Returns picture data with .json.
  // req.query.numberOfPictures = number of wanted pictures
  //
  // exports.handleGetRequest = function(req, res) {
    // console.log("+++++old reg handler");
    // // Handles get request, if need for pictures -> deliver them otherwise do something else
    // try {
      // // tests(); //uncomment for an additional test set that prints to console.log
      // initialRandomPictures(req.query)
      // .then(function(data) {
        // console.log("JSON SEND");
        // res.json({
          // picture: 1, //means what??
          // vacationInfo: 0, //means what??
          // tags: [],
          // data: data[0] //HERE: DB entries for req.query.numberOfPictures different pictures
        // });
      // });
    // }
    // catch (err) {
      // console.log(err.stack);
    // }
	// }

  exports.handlePostRequest = function(req,res) {
    console.log(req.body.data);
    res.json({ ok: "ok"});
  }


  //--------------------------------------------
  // Used by other files.
  //
  exports.handleGetRequestNew = function(req, res) {
    // tests(); //uncomment for an additional test set that prints to console.log
    console.log("+++++new reg handler");
    console.log(req.query);
    var nq = req.query;

    try {
      for(var key in req.query) {
        if(req.query.hasOwnProperty(key) && key !== 'type') {
          console.log("x");
          nq[key] = JSON.parse(req.query[key]);
        }
        else {console.log("skipped");}
      }
    } catch (err) {console.log(err.stack);}

    console.log("parsed?");

    if(nq.type === "InitialPictures") {
      console.log(nq);
      //--- uses:
      //-req.query.numberOfPictures: Wanted amount of returned DB entries.
      //--- should return:
      //-data: DB entries for 'numberOfPictures' random pictures
      //-randomIdOrder: Tells which pictures are still unasked and
      //gives user-specific randomized order of pictures.
      try {
        initialRandomPictures(nq)
        .then(function(returned) {
          console.log("JSON SEND 'InitialPictures'");
          console.log(returned);
          res.json({
            type: "MorePictures",
            picture: 1,
            vacationInfo: 0,
            data: returned[0],
            tags: [],
            scores: [],
            randomIdOrder: returned[1]
          });
        });
      }
      catch (err) {
        console.log(err.stack);
      }
    }
    else if(nq.type === "MorePictures") {
      console.log(nq);
      //--- uses:
      //-req.query.numberOfPictures: Wanted amount of returned DB entries.
      //-req.query.randomIdOrder: Tells which pictures are still unasked and
      //gives user-specific randomized order of pictures.
      //-req.query.data.accepted: 1D array of accepted tags for previous picture set only
      //-req.query.data.declined: 1D array of declined tags for previous picture set only
      //-req.query.numberInContention: Number of holiday packages kept in contention
      //for this set of pictures.
      //--- should return:
      //-data: DB entries for 'numberOfPictures' random pictures
      //-scores: Points after previous pictures for 'numberInContention' best
      //holiday packages.
      //-tags: List of most effective tags for holiday packages still in contention. Try to pick one of these when asking user.
      try {
        moreRandomPictures(nq)
        .then(function(returned) {
          console.log("JSON SEND 'MorePictures'");
          console.log(returned);
          if(true) {
            res.json({
              type: "BestHolidays",
              picture: 1,
              vacationInfo: 0,
              data: returned[0],
              scores: returned[1],
              tags: returned[2],
              randomIdOrder: []
            });
          }
          else {
            res.json({
              type: "MorePictures",
              picture: 1,
              vacationInfo: 0,
              data: returned[0],
              scores: returned[1],
              tags: returned[2],
              randomIdOrder: []
            });
          }
        });
      }
      catch (err) {
        console.log(err.stack);
      }
    }
    else if(nq.type === "BestHolidays") {
      console.log(nq);
      //--- uses:
      //-req.query.scores: Points after previous pictures for best holiday packages
      //--- should return:
      //-data: DB entries for 'numberReturned' best holiday packages, ordered highest score first
      try {
        bestHolidays(nq)
        .then(function(returned) {
          console.log("JSON SEND 'BestHolidays'");
          console.log(returned);
          res.json({
            type: "BestHolidays",
            picture: 0,
            vacationInfo: 1,
            tags: [],
            data: returned[0],
            scores: returned[1],
            randomIdOrder: []
          });
        });
      }
      catch (err) {
        console.log(err.stack);
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
		  console.log(err.stack);
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
      console.log(err.stack);
    }

    return deferred.promise;
  }


  //--------------------------------------------
  // Collects requested another set of random pictures
  // and counts scores for answers of the previous picture set
  function moreRandomPictures(query) {
    var deferred = q.defer();
    console.log("at moreRandomPictures");
    try {
      getInitializedHolidays()
      .then(function(scores) { //init scores
        console.log("-----------------------------initialized scores");
        console.log(scores);
        getBestScoredAlternatives(scores, query.numberInContention, query.data.accepted, query.data.declined) //n best scores
        .then(function(bestScores) {
          console.log("-----------------------------'numberInContention' best scores");
          console.log(bestScores);
          getTagList(bestScores)
          .then(function(tagList) {
            console.log("-----------------------------preferred tags");
            console.log(tagList);
            getRandomPicturesWithOrderAndTagList(query.randomIdOrder, tagList, query.numberOfPictures)
            .then(function(data) {
              console.log("-----------------------------picture entries");
              console.log(data);
              deferred.resolve([data, bestScores, tagList]);
            });
          });
        });
      });
    }
    catch (err) {
      console.log(err.stack);
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
  				console.log(err.stack);
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
  				console.log(err.stack);
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
      holidaysDb.find({},{fields:{_id: 1, tags: 1, multipliers: 1}},
        function(e,docs) {
          deferred.resolve(
            _.map(docs, function(entry){
                return [entry['_id'], _.zip(entry['tags'], entry['multipliers']), 0];
            })
          );
        }
      );
		}
		catch (err) {
		  console.log(err.stack);
      deferred.reject("error");
		}

    return deferred.promise;
  }


  //--------------------------------------------
  // Returns an array of n [_id, [[tag, multiplier] pairs], score] groups that
  // have highest scores.
  function getBestScoredAlternatives(holidayScores, n, accepted, declined) {
    var deferred = q.defer();
    console.log('at getBestScoredAlternatives');
    console.log(holidayScores);
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
            // count tag from declined
            rejCount = _.filter(declined, function(tag){
              return tag == tagMultipPair[0];
            }).length;
            // decrease points
            entry[2] = entry[2] - rejCount * tagMultipPair[1] * negMultip;
          });
        }
      );
      holidayScores.sort(function(a, b){return b[2]-a[2]});
      deferred.resolve(holidayScores.slice(0, Math.min(n, holidayScores.length)));
    }
    catch(err) {
		  console.log(err.stack);
      deferred.reject("error");
		}

    return deferred.promise;
  }



  function bestHolidays(query) {
    var deferred = q.defer();

    if(query.scores.length > 0) {
      try {
        getHolidaysForIds(_.map([query.scores[0]], function(tuple) {return tuple[0];}))
        .then(function(data) {
          console.log("-----------------------------holiday db entry");
          console.log(data);
          query.scores.shift();
          deferred.resolve([data[0], query.scores]); //as an array for symmetry with others
        });
      }
      catch (err) {
        console.log(err.stack);
      }
    }
    else {
      deferred.resolve([null,[]]);
    }
    return deferred.promise;
  }


  function getHolidaysForIds(ids) {
    var deferred = q.defer();

    console.log('at getHolidaysForIds');
    console.log(ids);
    var ret = [];
    var index = 0;
		var pickLimit = ids.length;

    async.whilst(
      function() {
  			return index < pickLimit;
  		},
  		function(next) {
  			try {
  				holidaysDb.findOne({_id: ids[index] },{},
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
  				console.log(err.stack);
  			}
  		},
  		function(err) {
        deferred.resolve(ret);
  		}
    );

    return deferred.promise;
	}


  //List of most efficient tags for holiday packages still in contention
  function getTagList(bestScores) { //[_id, [[tag, multiplier] pairs], score]
    var deferred = q.defer();
    console.log("at getTagList");
    console.log(bestScores);
    var tagsForHoliday = _.map(bestScores, function(tuple) {
      return _.map(tuple[1], function(tagMultipPair) {
        return tagMultipPair[0];
      });
    });
    console.log(tagsForHoliday);
    try {
      deferred.resolve(
        _.difference(
          _.reduce(tagsForHoliday, function(a, b){
            return _.union(a, b); }),
          _.reduce(tagsForHoliday, function(a, b){
            return _.intersection(a, b);
            })
          )
        );
    }
    catch (err) {
      console.log(err.stack);
    }

    return deferred.promise;
  }


  //a test set
  function tests() {

    try {
      console.log("\n***TEST: 'InitialPictures'");
      initialRandomPictures({numberOfPictures: 10})
      .then(function(returned) {
        console.log("***pictureData");
        console.log(returned[0]);
        console.log("***randomIdOrder");
        console.log(returned[1]);

        console.log("\n***TEST: 'MorePictures'");
        moreRandomPictures({numberOfPictures: 5, randomIdOrder: returned[1], accepted: ['beach', 'bar', 'reef'], declined: ['kids', 'tropical', 'friends'], numberInContention: 5})
       .then(function(ret) {
          console.log("***pictureData");
          console.log(ret[0]);
          console.log("***scores");
          console.log(ret[1]);
          console.log("***effectiveTags");
          console.log(ret[2]);

          console.log("\n***TEST: 'BestHolidays'");
          bestHolidays({accepted: ['beach', 'bar'], declined: ['tropical', 'friends'], scores: ret[1], numberReturned: 3})
          .then(function(re) {
            console.log("***holidayData");
            console.log(re[0]);
          });
        });
      });
    }
    catch (err) {
      console.log(err.stack);
    }
	}


	return exports;
};
