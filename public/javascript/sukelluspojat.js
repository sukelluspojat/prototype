// globals
var _globalIfDrag = false;
var spinner = new Spinner();
var SukellusSession = {
  screenContainer: {},
  stackElement: [],
  dataSet:  [],
  acceptedTags: [],
  declinedTags: [],
  preferredTags: []
}
var stack,
  throwOutConfidenceBind,
  throwOutOffset,
  throwOutConfidenceElements = {};

var initStack = function() {
  /////////////////////////////////////////////
  /////////////// STACK INIT ///////////////
  /////////////////////////////////////////////
  var config = {
    throwOutConfidence: function (offset, element) {
      // throwOutOffset.innerHTML = offset;
      if (Math.abs(offset) > 200) {
        return 1;
      }
      else {
        return Math.min(Math.abs(offset) / 200, 1);
      }
    }
  };
  stack = gajus.Swing.Stack(config);

  stack.on('throwout', function (e) {
      var lastIndex, parent, direction;
      toastr.options = {
        "showDuration": "300",
        "hideDuration": "300",
        "timeOut": "1000",
      }
      // the last react componen on the list
      lastIndex = SukellusSession.stackElement.length - 1;
      handleTag(SukellusSession.stackElement[lastIndex].props.data.tags, e.throwDirection);
      if (lastIndex === 0) {
        spinner.spin();
        SukellusSession.screenContainer.buildUrl();
        document.getElementById("viewport").appendChild(spinner.el);
      }
      if (e.throwDirection === 1) {
        toastr.options.positionClass = "toast-top-right";
        toastr.success('Yes!');
      }
      else {
        toastr.options.positionClass = "toast-top-left";
        toastr.error("No!");
      }
      // Use tags
      // check if last element -> let the server decide what to send next
      SukellusSession.stackElement.pop();
      e.target.classList.remove('in-deck');
      e.target.classList.add('off-deck');
      toastr.clear();
  });

  stack.on('dragmove', function (e) {
    throwOutConfidenceElements[e.throwDirection == gajus.Swing.Card.DIRECTION_RIGHT ? 'yes' : 'no']
      .opacity = e.throwOutConfidence - 0.3;
    throwOutConfidenceBind.innerHTML = e.throwOutConfidence.toFixed(2);
  });
  stack.on('dragstart', function (e) {
    throwOutConfidenceElements.yes = e.target.querySelector('.yes').style;
    throwOutConfidenceElements.no = e.target.querySelector('.no').style;


  });
  stack.on('dragend', function (e) {
    _globalIfDrag = true;
    if (e.throwOutConfidence != 1) {
        throwOutConfidenceElements.yes.opacity = 0;
        throwOutConfidenceElements.no.opacity = 0;
    }
  });

  UpdateStack();
}
/////////////////////////////////////////////////////////////////////
/////////////////////// Helper functions ///////////////////////
/////////////////////////////////////////////////////////////////////

var handleTag = function(tags, direction) {
  var tag, pTag;
  if (direction === 1) {
    //accepted
    for (var i=0;i<tags.length; i++) {
      if (SukellusSession.acceptedTags.indexOf(tags[i]) === -1) {
        if (SukellusSession.preferredTags.indexOf(tags[i]) != -1) {
          pTag = tags[i];
        }
        tag = tags[i];
      }
    }
    if (pTag) {
      SukellusSession.acceptedTags.push(pTag);
    }
    else if(tag) {
      SukellusSession.acceptedTags.push(tag);
    }
    else {
      SukellusSession.acceptedTags.push(tags[tags.length-1]);
    }

  }
  else {
    //declined
    for (var i=0;i<tags.length; i++) {
      if (SukellusSession.declinedTags.indexOf(tags[i]) === -1) {
        if (SukellusSession.preferredTags.indexOf(tags[i]) != -1) {
          pTag = tags[i];
        }
        tag = tags[i];
      }
    }
    if (pTag) {
      SukellusSession.declinedTags.push(pTag);
    }
    else if (tag) {
      SukellusSession.declinedTags.push(tag);
    }
    else {
      SukellusSession.declinedTags.push(tags[tags.length-1]);
    }
  }
  // document.getElementById("tags").innerHTML = "Accepted: " + SukellusSession.acceptedTags.join(', ') +
  //                                             "<br>Declined: " + SukellusSession.declinedTags.join(', ');
}

var handlePreferredTag = function(tag) {
    if (SukellusSession.preferredTags.indexOf(tag) != -1) {
      return true;
    }
    else {
      return false;
    }
}

document.onkeydown = function(e) {
  // left key for decline
  if (e.keyCode === 37) {
    removeFromStack(gajus.Swing.Card.DIRECTION_LEFT);
  }
  // right key for accept
  else if (e.keyCode === 39) {
    removeFromStack(gajus.Swing.Card.DIRECTION_RIGHT);
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
  [].forEach.call(document.querySelectorAll('.stackBinder li'), function (targetElement) {
      stack.createCard(targetElement);
      targetElement.classList.add('in-deck');
      targetElement.classList.remove('off-deck');
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
var Picture = React.createClass({
  render: function() {
    return (
      <img src={ this.props.url } className = { this.props.cName }></img>
    );
  }
})

var PictureInfo = React.createClass({
  render: function() {
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

var PictureSet = React.createClass({
  handleClick: function(event) {
    if (_globalIfDrag === false) {
        this.state.styleObj.display === 'none' ?
          this.setState({ styleObj: { display: 'block' } }) : this.setState({ styleObj: { display: 'none' } });
    }
    else {_globalIfDrag = false;}
  },
  componentDidMount: function() {
    SukellusSession.stackElement.push(this);
  },
  componentWillUnmount: function() {
  },
  getInitialState: function() {
      return { styleObj: { display: 'none'} };
  },
  render: function() {
    return (
      <li onClick={ this.handleClick } className='pictureListElement'>
        <div className='screen' id='screen'>
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
/////////////////////// VACATION LIST ELEMENTS ////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var VacationPicture = React.createClass({
  render: function() {
    return(
      <img src={ this.props.url } className={'vacationPicture'}> </img>
    );
  }
});

var VacationElement = React.createClass({
  handleScroll: function(e) {
    this.state.counter++;
    if (this.state.counter > 130) {
      var newPos = (this.state.positio + 1)%this.state.bgPictureAmount;
      this.setState({
        positio: newPos,
        counter: 0
      })
    }
    this.state.counter++;
  },
  handleMouseOver: function(e) {
    var newPos = (this.state.positio + 1)%this.state.bgPictureAmount;
    this.setState({
      positio: newPos
    })
  },
  getInitialState: function() {
    return {
      pictures: this.props.data.pictureUrls,
      data: this.props.data,
      styleObj: {},
      positio: 0,
      bgPictureAmount: 5,
      counter: 0,
      showOptions: 'none',
      showInfo: 'block',
      scores: this.props.scores,
      type: this.props.type
      };
  },
  handleDeclineClick: function(e) {
    this.setState({
      showOptions: 'block',
      showInfo: 'none'
    })
  },
  handleAccept: function(e) {
    SukellusSession.screenContainer.setState(
      {
        buttonText: "Plan a new holiday?",
        data: '',
        type: 'InitialPictures'
      }
    );
  },
  handleDeclineReason: function(e) {
    this.setState({buttonState: true});
    $.ajax({
      url: this.props.url +
        '?numberOfPictures=0'+
        '&randomIdOrder=0' +
        '&scores=' + JSON.stringify(this.state.scores) +
        '&type='+this.state.type +'&numberInContention=0',
      dataType: 'json',
      success: function(data) {
        if (data.data === null) {
          SukellusSession.screenContainer.setState(
            {
              buttonText: "Plan a new holiday?",
              data: '',
              type: 'InitialPictures'
            }
          );
          return;
        }

        this.setState({
          data: data.data,
          showOptions: 'none',
          showInfo: 'block',
          scores: data.scores,
          type: data.type,
          buttonState: false
        });
      }.bind(this),
      error: function(error) {
        console.log("Timeout");
      }.bind(this)
    });
  },
  render: function() {
    return(
      <div className="vacationBG" style={ {background: 'url('+this.state.pictures[this.state.positio]+')'}}>
        <div className={ 'vacationElement' } onScroll={this.handleScroll}>
          <div style={{display: this.state.showInfo}}>
            <h2>{ this.state.data.name }</h2>
            <p>{ this.state.data.infoText }</p>
            <h4>Price: {this.state.data.price}€</h4>
            <div className='acceptButtons'>
              <button className="action-button shadow animate blue" style={ {display: 'inline'} }
                onClick={ this.handleDeclineClick }> Decline </button>
              <button className="action-button shadow animate green" style={ {display: 'inline'} }
                onClick={ this.handleAccept }> Buy </button>
            </div>
          </div>
          <div className="declineButtonContainer" style={ {display: this.state.showOptions} }>
            <button className="action-button shadow animate yellow" style={ {display: 'block'} }
              onMouseOver={this.handleMouseOver} onClick={ this.handleDeclineReason } disabled={this.state.buttonState}> Price </button>
            <button className="action-button shadow animate yellow" style={ {display: 'block'} }
              onMouseOver={this.handleMouseOver} onClick={ this.handleDeclineReason } disabled={this.state.buttonState}> Location </button>
            <button className="action-button shadow animate yellow" style={ {display: 'block'} }
              onMouseOver={this.handleMouseOver} onClick={ this.handleDeclineReason } disabled={this.state.buttonState}> Distance </button>
            <button className="action-button shadow animate yellow" style={ {display: 'block'} }
              onMouseOver={this.handleMouseOver} onClick={ this.handleDeclineReason } disabled={this.state.buttonState}> Addtional Services </button>
            <button className="action-button shadow animate yellow" style={ {display: 'block'} }
              onMouseOver={this.handleMouseOver} onClick={ this.handleDeclineReason } disabled={this.state.buttonState}> Other </button>
          </div>
        </div>
      </div>
    );
  }
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////// SCREENCONTENT COMPONENT ///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var ScreenContent = React.createClass({
  loadDataFromServer: function() {
    this.setState({buttonState: true});
    var urlEnding = '?numberOfPictures='+this.state.numberOfPictures+
      '&randomIdOrder='+ JSON.stringify(this.state.randomIdOrder)+
      '&scores='+ JSON.stringify(this.state.scores) +
      '&type='+this.state.type + '&numberInContention='+
      this.state.numberInContention;
    $.ajax({
        url: this.props.url + urlEnding,
        dataType: 'json',
        success: function(data) {
          this.setState({
            data: data,
            numberOfPictures: '5',
            randomIdOrder: data.randomIdOrder,
            type: data.type,
            scores: data.scores,
            buttonState: false
          });
        }.bind(this),
        error: function(error) {
          console.log(error);
        }.bind(this)
    });
  },
  handleEmptySet: function(url) {
    $.ajax({
      url: this.props.url +
      '?numberOfPictures=' + this.state.numberOfPictures +
      '&randomIdOrder=' + JSON.stringify(this.state.randomIdOrder) +
      '&scores=' + JSON.stringify(this.state.scores) +
      '&type='+this.state.type +'&numberInContention='+
        this.state.numberInContention + url,
      dataType: 'json',
      success: function(data) {
        this.setState({
          data: data,
          numberOfPictures: '5',
          randomIdOrder: data.randomIdOrder,
          type: data.type,
          scores: data.scores
        });
      }.bind(this),
      error: function(error) {
        console.log(error);
        console.log("Timeout");
      }.bind(this)
    });
  },
  buildUrl: function() {
    var beginnig, acceptedTags, declinedTags;
    beginnig = '?numberOfPictures='+this.state.numberOfPictures+'&randomIdOrder='+
      JSON.stringify(this.state.randomIdOrder)+
      '&scores='+ JSON.stringify(this.state.scores) +'&type='+this.state.type;
    acceptedTags = '&accepted=' + JSON.stringify(SukellusSession.acceptedTags);
    declinedTags = '&declined=' + JSON.stringify(SukellusSession.declinedTags);
    var url = {
      accepted: SukellusSession.acceptedTags,
      declined: SukellusSession.declinedTags
    }
    var string = JSON.stringify(url);
    this.handleEmptySet('&data='+string);


  },
  getInitialState: function() {
    return {
      data: {data: ''},
      url: this.props.url,
      numberOfPictures: '5',
      randomIdOrder: [],
      type: 'InitialPictures',
      numberInContention: '5',
      scores: [],
      buttonText: 'Plan your Holiday!',
      buttonState: false
      };
  },
  componentWillMount: function() {
      SukellusSession.screenContainer = this;
  },
  componentDidUpdate: function() {
    initStack();
    spinner.stop();
  },
  render: function() {
    var dataType, data;
    dataType = this.state.data;
    data = dataType.data;
    if (dataType.picture === 1) {
      var pictures = data.map(function(data) {
        return <PictureSet data={ data } key={ data._id } />;
      });
      return (
        <ul className = "stack stackBinder">
          { pictures }
        </ul>
      );
    }
    else if ( dataType.vacationInfo === 1) {
      return (
        <div className='screenContainer'>
          <div className='screen' id='screen'>
            <VacationElement data={ data } url={ this.props.url} scores={this.state.scores} type={this.state.type} />
          </div>
        </div>
      );
    }
    else {
      return (
        <div className='screenContainer'>
          <div className='screen' id='screen'>
            <div className='verticalHelperOuter'>
              <div className='verticalHelperInner'>
                <button className="action-button shadow animate yellow" style={ {display: 'block'} }
                  onClick={this.loadDataFromServer} disabled={this.state.buttonState}> {this.state.buttonText} </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

  }
})

var Viewport = React.createClass({
    render: function() {
        return (
            <div id = "viewport">
                <ScreenContent url={this.props.url} />
            </div>
        );
    }
});
React.render(<Viewport url={ '/pictureset' } />, document.getElementById("container"));
