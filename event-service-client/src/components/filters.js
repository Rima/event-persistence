import React, { Component } from 'react';
const _ = require('lodash');

class Filters extends Component {

  componentWillMount () {
     this.delayedCallback = _.debounce( (event) => {
       this.props.handleFilter(event);
     }, 500);
  }

  fireWithDelay (event) {
    event.persist();
    this.delayedCallback(event);
  }


  render(){
    return (
      <div>
        <div>
        Filter by Type: <input name="type" onKeyUp={this.fireWithDelay.bind(this)} />
        </div>
        <div>
        Filter by ServiceId: <input name="serviceId" onKeyUp={this.fireWithDelay.bind(this)} />
        </div>

      </div>

    )
  }
}

export default Filters;
