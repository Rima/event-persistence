import React, { Component } from 'react';
import './App.css';

import EventsList from './EventsListWS';

class App extends Component {

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>Hiya! You can manage events here</h2>
        </div>
        <h2>events</h2>
          <EventsList />
      </div>
    );
  }
}

export default App;
