import React, { Component } from 'react';
import io from 'socket.io-client'


const socket = io('http://localhost:5001')

class Event extends Component {

  constructor() {
    super();
    this.state = {};
  }

  handleDelete(e) {
    return fetch(`http://localhost:5001/api/events/${e.target.id}`, {
      method: 'DELETE'
    })
    .then(response => {
      if (!response.ok) {
        this.props.listMessenger('could not delete event');
        return;
      }
      return;
    });

  }

  render(){
    //incase data is a json object
    let dataVal = JSON.stringify(this.props.content.data);
    return (
      <tr key={this.props.content.id}>
        <td>{this.props.content.id}</td>
        <td>{this.props.content.type}</td>
        <td>{this.props.content.serviceId}</td>
        <td>{dataVal}</td>
        <td id={this.props.content.id} className='delete' onClick={this.handleDelete.bind(this)}>Delete Event</td>
      </tr>
    )
  }
}

class EventsList extends Component {

  constructor() {
    super();
    this.pageNum = 1;

    this.state = {
      requestFailed: false,
      message: '',
      events: []
    };
  }

  messenger(msg){
    this.setState({message: msg});
  }
  handleNew(content){
    this.state.events.splice(0, 0, content);
    this.messenger("got a new event.. ");
  }

  handleDelete(eventId){
    //TODO can implement broadcast   socket.broadcast.emit('broadcast', 'hello friends!');
    //that way we can defrentiate locally deleted messages from msgs deleted by other clients.
    let newState = this.state.events;
    let deleted_obj_index = newState.findIndex( (item) => { return item.id === eventId })
    if (deleted_obj_index > -1) {
      newState.splice(deleted_obj_index, 1);
      this.setState({events: newState})
    }
    this.messenger(`event ${eventId} removed.. `);
  }

  loadEvents(t, e, page){
    //TODO move url to configuration
    if (this.state.pausePagination) return;
    if(!page) page = this.pageNum;
    fetch(`http://localhost:5001/api/events?page=${page}`)
      .then(response => {
        if (!response.ok) {
          this.messenger("Network request failed")
          this.requestFailed = true;
          return;
        }
        return response;
      })
      .then(d => d.json())
      .then(d => {
        if (!d.length){
          this.setState({pausePagination : true})
          this.messenger("no more events to load .. ");
          return;
        }
        //if we have too many events, remove the head events
        if (this.state.events.length >= 100){
          this.state.events.splice(0, 50);
        }
        this.setState({ events: this.state.events.concat(d) });
        this.pageNum += 1;
      }, (err) => {
        this.setState({ requestFailed: true })
        this.messenger("couldn't load more events.." )
      })
  }

  _initialize(){
    if (!this._initilized) this.loadEvents(null, null, 1);
    this._initilized = true;
  }
  componentDidMount() {
    socket.on('connect', this._initialize.bind(this));
    socket.on('event_deleted', this.handleDelete.bind(this));
    socket.on('event_new', this.handleNew.bind(this));
  }

  render(){
    if (this.state.requestFailed && !this.state.events) return <p>Failed to load resources!</p>
    if (!this.state.events) return <p>Loading...</p>

    return (
        <div className='events'>
          <p>{this.state.message}</p>
          <table>
            <thead>
              <tr>
                <th>Event Id</th>
                <th>Type</th>
                <th>Emitting Service Id</th>
                <th>Message Content</th>
                <th>Action</th>
              </tr>
            </thead>
             <tfoot>
        {this.state.events.map((item, i) => (
          <Event content={item} key={i} listMessenger={this.messenger.bind(this)} />
        ))}
      </tfoot>
        </table>

        <button disabled={this.state.pausePagination} onClick={this.loadEvents.bind(this)}> Load more </button>
      </div>

    )
  }
}

export default EventsList;
