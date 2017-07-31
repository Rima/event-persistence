import React, { Component } from 'react';
import './App.css';

import {EventList, Filters} from './components';
import EventsManager from './services/EventsManager';
import io from 'socket.io-client'

let config = require ('./config')


const socket = io(config.SERVER_URL);


class App extends Component {

  constructor(){
    super();
    this.state = {
      message: '',
      events: [],
      _initialized: false
    }
    this.em = new EventsManager();
  }


  handleFilter(e){
    let fval = e.target.value;
    let fname = e.target.name;
    let filter = {}; filter[fname] = fval;
    
    this.em.assignFilter(filter, (err, succ, l) => {
      if(succ){
        if(!l) this.messenger('no events matching query ..')
       this.updateList();
      }
    });
  }

  _initialize(){
    if (!this.state || !this.state._initialized){
      this.em.all((err, succ, l) => {
        if (err){
          this.messenger('failed to load content .. ');
          return;
        }
        this.updateList();
      });
      this.setState( {_initialized: true} );
    }
  }

  handleNew(content){
    this.em.push(content);
    this.updateList();
    this.messenger("got a new event.. ");
  }
  handleDelete(eventId){
    this.em.pop(eventId);
    this.updateList();
    this.messenger(`event deleted.. Id: ${eventId} `);
  }
  handleDeleteRequest(e) {
    this.em.delete(e.target.id, (err, success) => {
      if (err){
        this.messenger('could not delete event');
        return;
      }
    });
  }

  /* sockets handling should probably be moved to services */
  componentDidMount(){
    socket.on('connect', this._initialize.bind(this));
    socket.on('event_deleted', this.handleDelete.bind(this));
    socket.on('event_new', this.handleNew.bind(this));
  }

  loadMore(){
    this.em.loadMore((err, suc, l) => {
      if (err){
        this.messenger("failed to load more events .. ");
        return;
      }
      if(!l){
        this.messenger("no more events to load ...");
        this.setState({pausePagination: this.em.listConfig.pausePagination})
        return;
      }
      this.updateList();
      return;
    });
  }


  updateList(){
    this.setState({events: this.em.events, listConfig: this.em.listConfig});
  }
  messenger(msg){
    this.setState({message: msg});
  }

  render() {
    if (!this.state._initialized) return null;
    return (
      <div className="App">
        <div className="App-header">
          <h2>Hiya! You can manage events here</h2>
        </div>
        <p>{this.state.message}</p>
        <h2>Filters</h2>
          <Filters handleFilter={this.handleFilter.bind(this)} />
        <h2>events</h2>
          <EventList events={this.state.events} pausePagination={this.state.pausePagination}
            loadMore={this.loadMore.bind(this)} handleDelete={this.handleDeleteRequest.bind(this)} />
      </div>
    );
  }
}

export default App;
