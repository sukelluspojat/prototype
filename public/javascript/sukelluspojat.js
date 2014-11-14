// quick solution for event handling problems
var _globalIfDrag = false;

var SukellusSession = {
  screenContainer: {},
  stackElement: [],
  dataSet:  [],
  acceptedTags: [],
  declinedTags: []
}
/////////////////////////////////////////////
/////////////// STACK INIT ///////////////
/////////////////////////////////////////////
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
    var lastIndex, parent, direction;
    // the last react componen on the list
    lastIndex = SukellusSession.stackElement.length - 1;
    handleTag(SukellusSession.stackElement[lastIndex].props.data.tags, e.throwDirection);
    console.log(lastIndex);
    if (lastIndex === 0) {
      SukellusSession.screenContainer.handleEmptySet();
    }
    // Use tags
    // check if last element -> let the server decide what to send next
    SukellusSession.stackElement.pop();
    parent = e.target.parentNode;
    e.target.style.display = 'none';
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
/////////////////////////////////////////////////////////////////////
/////////////////////// Helper functions ///////////////////////
/////////////////////////////////////////////////////////////////////

var handleTag = function(tags, direction) {
  if (direction === 1) {
    //accepted
    for (var i=0;i<tags.length; i++) {
      if (SukellusSession.acceptedTags.indexOf(tags[i]) === -1) {
        SukellusSession.acceptedTags.push(tags[i]);
        break;
      }
    }
  }
  else {
    //declined
    for (var i=0;i<tags.length; i++) {
      if (SukellusSession.declinedTags.indexOf(tags[i]) === -1) {
        SukellusSession.declinedTags.push(tags[i]);
        break;
      }
    }
  }
  document.getElementById("tags").innerHTML = "Accepted: " + SukellusSession.acceptedTags +
                                              "<br>Declined: " + SukellusSession.declinedTags;
}

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

var UpdateStack = function() {
  // update stack
  console.log("Stack updated");
  [].forEach.call(document.querySelectorAll('.stackBinder li'), function (targetElement) {
      stack.createCard(targetElement);
      targetElement.classList.add('in-deck');
  });
}
/////////////////////////////////////////////////////////////////////
/////////////////////// REACT PART ///////////////////////
/////////////////////////////////////////////////////////////////////
var WatchText = React.createClass({
  render: function() {
    return (<span dangerouslySetInnerHTML={{__html: this.props.data}}></span>);
  }
})
/////////////////////// PICTURE ELEMENTS ///////////////////////
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
    console.log("component mounted");
    SukellusSession.stackElement.push(this);
  },
  componentWillUnmount: function() {
    console.log("unmount");
  },
  getInitialState: function() {
      return { styleObj: { display: 'none'} };
  },
  render: function() {
    return (
      <li onClick={ this.handleClick } onDragStart={ this.handleDragEnd } className='pictureListElement'>
        <div className='screen'>
          <Picture url={ this.props.data.url } cName="picture"/>
          <PictureInfo data={ this.props.data } styleObj={ this.state.styleObj } />
        </div>
        <div className="yes"></div>
        <div className="no"></div>
        <svg height="120" width="320">
          <circle cx="160" cy="63" r="34" stroke="black" strokeWidth="3" fill="transparent" />
        </svg>
      </li>
    );
  }
})
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////// VACATION LIST ELEMENTS ///////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var VacationListElement = React.createClass({
  render: function() {
    return(
      <div className={'vacatonListElement'}>
        <h3>{ this.props.data.infoHeading }</h3>
        <p>{ this.props.data.infoText }</p>
      </div>
    );
  }
});
var VacationList = React.createClass({
  render: function() {
    return(
      <li onClick={ this.handleClick } className='vacationList'>
        <div className='screen'>
          <VacationListElement data={ this.props.data } />
          <div className="yes"></div>
          <div className="no"></div>
        </div>
      </li>
    );
  }
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////// SCREENCONTENT COMPONENT ///////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var ScreenContent = React.createClass({
  loadDataFromServer: function(url) {
    $.ajax({
        url: url,
        dataType: 'json',
        success: function(data) {
          this.setState({data: data});
          console.log(data);
          console.log("ajax GET");
        }.bind(this),
        error: function(error) {
          console.log(error);
        }.bind(this)
    });
  },
  handleEmptySet: function() {
    console.log("handleEmptySet");
    //post tags to server
    $.ajax({
        url: this.props.url,
        type: 'POST',
        dataType: 'json',
        data: {
          accepted: SukellusSession.acceptedTags,
          declined: SukellusSession.declinedTags
        },
        success: function(data) {
          this.loadDataFromServer('/users');
          console.log("ajax POST");
        }.bind(this),
        error: function(error) {
          console.log(error);
        }.bind(this)
    });
  },
  getInitialState: function() {
        console.log("init");
        return { data: {data: ''} };
  },
  componentWillMount: function() {
      this.loadDataFromServer(this.props.url);
      SukellusSession.screenContainer = this;
  },
  componentDidUpdate: function() {
    console.log("DidUpdate");
    UpdateStack();
  },
  render: function() {
    var dataType, data;
    console.log("render");
    dataType = this.state.data;
    data = dataType.data;
    if (dataType === null) {
      return (
        <div className='screenContainer'>
        </div>
      );
    }
    else if (dataType.picture === 1) {
      var pictures = data.map(function(data) {
        return <PictureSet data={ data } key={ data.id } />;
      });
      return (
        <ul className = "stack stackBinder">
          { pictures }
        </ul>
      );
    }
    else if ( dataType.vacationList === 1) {
      // DO STUFF
      var vacationElements = data.map(function(data) {
        return <VacationList data={ data } key={ data.id } />;
      });
      return (
        <ul className = "stackVacation stackBinder">
          { vacationElements }
        </ul>
      );

    }
    else if ( dataType.vacationInfo === 1) {
      // DO STUFF
      return (
        <div className='screenContainer'>
          <div className='screen'>
          </div>
        </div>
      );
    }
    else {
      return (
        <div className='screenContainer'>
          <div className='screen'>
          </div>
        </div>
      );
    }

  }
})

var Viewport = React.createClass({
    render: function() {
      console.log("viewport");
        return (
            <div id = "viewport">
                <ScreenContent url={this.props.url} />
            </div>
        );
    }
});

React.renderComponent(<Viewport url={ '/users' } />, document.getElementById("container"));
