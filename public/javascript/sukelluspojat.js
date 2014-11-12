// quick solution for event handling problems
var _globalIfDrag = false;

/////////////// STACK INIT
var stack,
  throwOutConfidenceBind,
  throwOutOffset,
  throwOutConfidenceElements = {};
throwOutConfidenceBind = document.querySelector('#throw-out-confidence-bind');
throwOutOffset = document.querySelector('#throw-out-offset');
var config = {
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


stack.on('throwout', function (e) {
    var parent = e.target.parentNode;
    e.throwDirection === 1 ? (function() {console.log("accepted")})() : (function() {console.log("decline")})();
    parent.removeChild(e.target);
});

stack.on('dragmove', function (e) {
  throwOutConfidenceElements[e.throwDirection == gajus.Swing.Card.DIRECTION_RIGHT ? 'yes' : 'no']
    .opacity = e.throwOutConfidence - 0.3;
  throwOutConfidenceBind.innerHTML = e.throwOutConfidence.toFixed(2);
});
stack.on('dragstart', function (e) {
  console.log("drag start stack");
  throwOutConfidenceElements.yes = e.target.querySelector('.yes').style;
  throwOutConfidenceElements.no = e.target.querySelector('.no').style;


});
stack.on('dragend', function (e) {
  console.log("drag end stack");
  _globalIfDrag = true;
  if (e.throwOutConfidence != 1) {
      throwOutConfidenceElements.yes.opacity = 0;
      throwOutConfidenceElements.no.opacity = 0;
  }
});
document.addEventListener('DOMContentLoaded', function () {


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

var UpdateStack = function() {
  [].forEach.call(document.querySelectorAll('.stack li'), function (targetElement) {
      stack.createCard(targetElement);
      targetElement.classList.add('in-deck');
  });
}

function pictureClick(element) {
  var display,
      infoElements = element.querySelectorAll(".pictureInfo");
  // console.log(element);
  // element.handleDragEnd;
  infoElements[0].style.display === 'none' ? display = 'block' : display = 'none';
  infoElements[0].style.display = display;
  console.log(infoElements[0]);
}

/////////////////////// REACT PART
var WatchText = React.createClass({
  render: function() {
    return (<span dangerouslySetInnerHTML={{__html: this.props.data}}></span>);
  }
})

var PictureInfo = React.createClass({
  render: function() {
    console.log(this.props.data);
    return (
      <div className = 'pictureInfo' style={ this.props.styleObj }>
        <h2>{ this.props.data.infoHeading }</h2>
        <p>{ this.props.data.infoText }</p>
        <Picture url = {this.props.data.watchUrl} cName='diveWatch' />
        <div className='diveWatchContainer'>
          <WatchText data={this.props.data.watchText} />
        </div>
      </div>
    );
  }
})

var Picture = React.createClass({
  render: function() {
    return (
      <img src={ this.props.url } className = { this.props.cName }></img>
    );
  }
})

var PictureSet = React.createClass({
  handleClick: function(event) {
    if (_globalIfDrag === false) {
        this.state.styleObj.display === 'none' ?
          this.setState({ styleObj: { display: 'block' } }) : this.setState({ styleObj: { display: 'none' } });
    }
    else {_globalIfDrag = false;}

  },
  handleDragEnd: function(e) { console.log("dragend"); },
  componentDidMount: function() {
  },
  componentWillUnmount: function() {
    console.log("unmount");
  },
  getInitialState: function() {
      return { styleObj: { display: 'none'} };
  },
  render: function() {
    return (
      <li onClick={ this.handleClick } onDragEnd={ this.handleDragEnd }>
        <div className='screen'>
          <Picture url={ this.props.data.url } cName="picture"/>
          <PictureInfo data={ this.props.data } styleObj={ this.state.styleObj } />
        </div>
        <div className="yes"></div>
        <div className="no"></div>
      </li>
    );
  }
})
var Pictures = React.createClass({
  loadPicturesFromServer: function() {
    $.ajax({
        url: this.props.url,
        dataType: 'json',
        success: function(data) {
          this.setState({data: data});
          console.log("ajax");
        }.bind(this),
        error: function(error) {
          console.log(error);
        }.bind(this)
    });
  },
  getInitialState: function() {
        console.log("init");
        return { data: [] };
  },
  componentWillMount: function() {
      this.loadPicturesFromServer();
  },
  componentDidUpdate: function() {
    UpdateStack();
  },
  render: function() {
    var data = this.state.data;
    console.log(this.state.data);
    var pictures = data.map(function(data) {
      return <PictureSet data={ data } key={ data.id } />;
    });
    return (
      <ul className = "stack">
        { pictures }
      </ul>
    );
  }
})

var Viewport = React.createClass({
    render: function() {
      console.log("viewport");
        return (
            <div id = "viewport">
                <Pictures url={this.props.url} />
            </div>
        );
    }
});

React.renderComponent(<Viewport url={ '/users' } />, document.getElementById("container"));
