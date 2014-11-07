var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
  res.json([
      {
          "id" : 1,
          "url": "/images/image_001.jpg",
          "info": "jotain",
          "watchInfo": "jotain",
          "watchUrl": "/images/suunto.png",
          "tags": [
              "hot",
              "bar",
              "friends"
          ]
      },
      {
          "id" : 2,
          "url": "/images/image_002.jpg",
          "info": "jotain",
          "watchInfo": "jotain",
          "watchUrl": "/images/suunto.png",
          "tags": [
              "hot",
              "shark",
              "family"
          ]
      },
      {
          "id" : 3,
          "url": "/images/image_003.jpg",
          "info": "jotain",
          "watchInfo": "jotain",
          "watchUrl": "/images/suunto.png",
          "tags": [
              "hot",
              "baar",
              "friends"
          ]
      }
  ]);
});

module.exports = router;
