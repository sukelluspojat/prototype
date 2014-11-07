
document.addEventListener('DOMContentLoaded', function () {
    var stack,
      throwOutConfidenceBind,
      throwOutOffset,
      throwOutConfidenceElements = {};
    throwOutConfidenceBind = document.querySelector('#throw-out-confidence-bind');
    throwOutOffset = document.querySelector('#throw-out-offset');
    var config = {
      // example of a throwout distance, we can deside what is the optional distance. Default is calculating
      // distance from element and swipe start
      // transform: function () {return 20},
      throwOutConfidence: function (offset, element) {
        throwOutOffset.innerHTML = offset;
        if (Math.abs(offset) > 200) {
          return 1;
        }
        else {
          return Math.min(Math.abs(offset) / 200, 1);
        }
      }
    };
    stack = gajus.Swing.Stack(config);
    throwOutConfidenceBind = document.querySelector('#throw-out-confidence-bind'),

    [].forEach.call(document.querySelectorAll('.stack li'), function (targetElement) {
        stack.createCard(targetElement);
        targetElement.classList.add('in-deck');
    });

    stack.on('throwout', function (e) {
        var parent = e.target.parentNode;
        e.throwDirection === 1 ? (function() {console.log("accepted")})() : (function() {console.log("decline")})();
        console.log(e);
        parent.removeChild(e.target);

        // e.target.classList.remove('in-deck');
        // e.target.classList.add('hidden');
    });

    stack.on('dragmove', function (e) {
      throwOutConfidenceElements[e.throwDirection == gajus.Swing.Card.DIRECTION_RIGHT ? 'yes' : 'no']
        .opacity = e.throwOutConfidence - 0.3;
      throwOutConfidenceBind.innerHTML = e.throwOutConfidence.toFixed(2);
    });
    stack.on('dragstart', function (e) {
      console.log("drag start");
      throwOutConfidenceElements.yes = e.target.querySelector('.yes').style;
      throwOutConfidenceElements.no = e.target.querySelector('.no').style;


    });
    stack.on('dragend', function (e) {
      pictureClick(e.target);
      if (e.throwOutConfidence != 1) {
          throwOutConfidenceElements.yes.opacity = 0;
          throwOutConfidenceElements.no.opacity = 0;
      }
    });

    document.onkeydown = function(e) {
      // left key for decline
      if (e.keyCode === 37) {
        removeFromStack(gajus.Swing.Card.DIRECTION_LEFT);
        console.log('declineKey');
      }
      // right key for accept
      else if (e.keyCode === 39) {
        removeFromStack(gajus.Swing.Card.DIRECTION_RIGHT);
        console.log('acceptedKey');
      }
    };

    var removeFromStack = function(direction) {
      var pictures, picture;
      pictures = document.querySelectorAll(".in-deck");
      if (pictures.length > 0) {
        picture = stack.getCard(pictures.item(pictures.length - 1));
        picture.throwOut(direction, 0);
      }
      else {
        // DO STUFF to load more pictures etc.
      }

    }
});

function pictureClick(element) {
  var display,
      watchElements = element.querySelectorAll(".diveWatch"),
      infoElements = element.querySelectorAll(".pictureInfo");
  watchElements[0].style.display === '' ? display = 'block' : display = '';
  watchElements[0].style.display = display;
  infoElements[0].style.display = display;
}
