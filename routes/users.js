var express = require('express');
var router = express.Router();

var dummyCounter = 1;
/* GET users listing. */
router.get('/', function(req, res) {
  if (false) {
    res.json(
      {
        picture: 1,
        vacationList: 0,
        vacationInfo: 0,
        data: [
        {
            "id" : 1 * dummyCounter,
            "url": "/images/image_001.jpg",
            "infoHeading": "Some Heading",
            "infoText": "American Apparel aesthetic gentrify, " +
              "craft beer High Life Pitchfork semiotics stumptown bespoke keytar." +
              "Tousled try-hard organic, shabby chic cray iPhone Williamsburg keytar cred Intelligentsia keffiyeh" +
              "occupy cliche Vice. Quinoa literally tattooed, occupy selvage Neutra kitsch lomo cold-pressed beard." +
              "Schlitz DIY synth, kale chips cornhole letterpress Etsy selfies tousled distillery lo-fi health" +
              "goth tilde put a bird on it jean shorts. Pop-up American Apparel locavore, lo-fi art party" +
              "mumblecore messenger bag asymmetrical crucifix distillery Williamsburg mustache semiotics" +
              "master cleanse stumptown.",
            "watchText": "<br>Depth<br><br>30-50m<br>",
            "watchUrl": "/images/suunto.png",
            "tags": [
                "hot",
                "bar",
                "friends"
            ]
        },
        {
            "id" : 2 * dummyCounter,
            "url": "/images/image_002.jpg",
            "infoHeading": "Some Heading",
            "infoText": "American Apparel aesthetic gentrify, " +
              "craft beer High Life Pitchfork semiotics stumptown bespoke keytar." +
              "Tousled try-hard organic, shabby chic cray iPhone Williamsburg keytar cred Intelligentsia keffiyeh" +
              "occupy cliche Vice. Quinoa literally tattooed, occupy selvage Neutra kitsch lomo cold-pressed beard." +
              "Schlitz DIY synth, kale chips cornhole letterpress Etsy selfies tousled distillery lo-fi health" +
              "goth tilde put a bird on it jean shorts. Pop-up American Apparel locavore, lo-fi art party" +
              "mumblecore messenger bag asymmetrical crucifix distillery Williamsburg mustache semiotics" +
              "master cleanse stumptown.",
            "watchText": "<br>Excite-<br>ment<br>Level<br><br>MAX!<br>",
            "watchUrl": "/images/suunto.png",
            "tags": [
                "hot",
                "shark",
                "family"
            ]
        },
        {
            "id" : 3 * dummyCounter,
            "url": "/images/image_003.jpg",
            "infoHeading": "Some Heading",
            "infoText": "American Apparel aesthetic gentrify, " +
              "craft beer High Life Pitchfork semiotics stumptown bespoke keytar." +
              "Tousled try-hard organic, shabby chic cray iPhone Williamsburg keytar cred Intelligentsia keffiyeh" +
              "occupy cliche Vice. Quinoa literally tattooed, occupy selvage Neutra kitsch lomo cold-pressed beard." +
              "Schlitz DIY synth, kale chips cornhole letterpress Etsy selfies tousled distillery lo-fi health" +
              "goth tilde put a bird on it jean shorts. Pop-up American Apparel locavore, lo-fi art party" +
              "mumblecore messenger bag asymmetrical crucifix distillery Williamsburg mustache semiotics" +
              "master cleanse stumptown.",
            "watchUrl": "/images/suunto.png",
            "watchText": "Air<br>30 C<br><br>Water<br>24 C",
            "tags": [
                "hot",
                "bar",
                "friends"
            ]
        }
    ]});

  }
  else {
    res.json(
      {
        picture: 0,
        vacationList: 0,
        vacationInfo: 1,
        data:
          {
            "id" : 1 * dummyCounter,
            "infoHeading": "Some Heading",
            "infoText": "American Apparel aesthetic gentrify, " +
              "craft beer High Life Pitchfork semiotics stumptown bespoke keytar." +
              "Tousled try-hard organic, shabby chic cray iPhone Williamsburg keytar cred Intelligentsia keffiyeh" +
              "occupy cliche Vice. Quinoa literally tattooed, occupy selvage Neutra kitsch lomo cold-pressed beard." +
              "Schlitz DIY synth, kale chips cornhole letterpress Etsy selfies tousled distillery lo-fi health" +
              "goth tilde put a bird on it jean shorts. Pop-up American Apparel locavore, lo-fi art party" +
              "mumblecore messenger bag asymmetrical crucifix distillery Williamsburg mustache semiotics" +
              "craft beer High Life Pitchfork semiotics stumptown bespoke keytar." +
              "Tousled try-hard organic, shabby chic cray iPhone Williamsburg keytar cred Intelligentsia keffiyeh" +
              "occupy cliche Vice. Quinoa literally tattooed, occupy selvage Neutra kitsch lomo cold-pressed beard." +
              "Schlitz DIY synth, kale chips cornhole letterpress Etsy selfies tousled distillery lo-fi health" +
              "goth tilde put a bird on it jean shorts. Pop-up American Apparel locavore, lo-fi art party" +
              "mumblecore messenger bag asymmetrical crucifix distillery Williamsburg mustache semiotics" +
              "craft beer High Life Pitchfork semiotics stumptown bespoke keytar." +
              "Tousled try-hard organic, shabby chic cray iPhone Williamsburg keytar cred Intelligentsia keffiyeh" +
              "occupy cliche Vice. Quinoa literally tattooed, occupy selvage Neutra kitsch lomo cold-pressed beard." +
              "Schlitz DIY synth, kale chips cornhole letterpress Etsy selfies tousled distillery lo-fi health" +
              "goth tilde put a bird on it jean shorts. Pop-up American Apparel locavore, lo-fi art party" +
              "mumblecore messenger bag asymmetrical crucifix distillery Williamsburg mustache semiotics" +
              "craft beer High Life Pitchfork semiotics stumptown bespoke keytar." +
              "Tousled try-hard organic, shabby chic cray iPhone Williamsburg keytar cred Intelligentsia keffiyeh" +
              "occupy cliche Vice. Quinoa literally tattooed, occupy selvage Neutra kitsch lomo cold-pressed beard." +
              "Schlitz DIY synth, kale chips cornhole letterpress Etsy selfies tousled distillery lo-fi health" +
              "goth tilde put a bird on it jean shorts. Pop-up American Apparel locavore, lo-fi art party" +
              "mumblecore messenger bag asymmetrical crucifix distillery Williamsburg mustache semiotics" +
              "master cleanse stumptown.",
            "pictureUrls": ["/images/image_002.jpg", "/images/image_003.jpg", "/images/image_004.jpg"]
          }

        // [
        // {
        //     "id" : 1 * dummyCounter,
        //     "infoHeading": "Some Heading",
        //     "infoText": "American Apparel aesthetic gentrify, " +
        //       "craft beer High Life Pitchfork semiotics stumptown bespoke keytar." +
        //       "Tousled try-hard organic, shabby chic cray iPhone Williamsburg keytar cred Intelligentsia keffiyeh" +
        //       "occupy cliche Vice. Quinoa literally tattooed, occupy selvage Neutra kitsch lomo cold-pressed beard." +
        //       "Schlitz DIY synth, kale chips cornhole letterpress Etsy selfies tousled distillery lo-fi health" +
        //       "goth tilde put a bird on it jean shorts. Pop-up American Apparel locavore, lo-fi art party" +
        //       "mumblecore messenger bag asymmetrical crucifix distillery Williamsburg mustache semiotics" +
        //       "master cleanse stumptown."
        // },
        // {
        //     "id" : 2 * dummyCounter,
        //     "infoHeading": "Some Heading",
        //     "infoText": "American Apparel aesthetic gentrify, " +
        //       "craft beer High Life Pitchfork semiotics stumptown bespoke keytar." +
        //       "Tousled try-hard organic, shabby chic cray iPhone Williamsburg keytar cred Intelligentsia keffiyeh" +
        //       "occupy cliche Vice. Quinoa literally tattooed, occupy selvage Neutra kitsch lomo cold-pressed beard." +
        //       "Schlitz DIY synth, kale chips cornhole letterpress Etsy selfies tousled distillery lo-fi health" +
        //       "goth tilde put a bird on it jean shorts. Pop-up American Apparel locavore, lo-fi art party" +
        //       "mumblecore messenger bag asymmetrical crucifix distillery Williamsburg mustache semiotics" +
        //       "master cleanse stumptown."
        // },
        // {
        //     "id" : 3 * dummyCounter,
        //     "infoHeading": "Some Heading",
        //     "infoText": "American Apparel aesthetic gentrify, " +
        //       "craft beer High Life Pitchfork semiotics stumptown bespoke keytar." +
        //       "Tousled try-hard organic, shabby chic cray iPhone Williamsburg keytar cred Intelligentsia keffiyeh" +
        //       "occupy cliche Vice. Quinoa literally tattooed, occupy selvage Neutra kitsch lomo cold-pressed beard." +
        //       "Schlitz DIY synth, kale chips cornhole letterpress Etsy selfies tousled distillery lo-fi health" +
        //       "goth tilde put a bird on it jean shorts. Pop-up American Apparel locavore, lo-fi art party" +
        //       "mumblecore messenger bag asymmetrical crucifix distillery Williamsburg mustache semiotics" +
        //       "master cleanse stumptown."
        // }
    // ]
    });

  }
    dummyCounter += 1;
});

router.post('/', function(req, res) {
  res.json( { data: "success" });
});

module.exports = router;
