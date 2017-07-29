import React, { Component } from 'react';


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
        this.props.listDelete('cannot_delete', null);
        return;
      }
      this.props.listDelete(this.props.content, null, true);
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
    this.pageOffset = 0;

    this.state = {
      requestFailed: false,
      message: '',
      events: []
    };
  }

  handleDelete(item, err, success){
    if (err){
      this.setState({message: "could not delete event"});
    }
    if (success){
      let newState = this.state.events;
      if (newState.indexOf(item) > -1) {
        newState.splice(newState.indexOf(item), 1);
        this.setState({events: newState})
      }
      this.setState({message: "successfuly deleted"})
    }
  }

  loadEvents(page){
    //TODO move url to configuration
    if(!page) page = this.pageOffset + 1;
    console.log(page);

    fetch(`http://localhost:5001/api/events?page=${page}`)
      .then(response => {
        if (!response.ok) {
          this.setState({message: "Network request failed"})
          return;
        }
      })
      .then(d => d.json())
      .then(d => {
        //if we have too many events, remove the head events
        if (!d.length){
          this.setState({message: "no more events to load .. "});
          return;
        }
        if (this.state.events.length >= 100){
          this.state.events.splice(0, 50);
        }
        this.state.events.concat(d);
      }, () => {
        this.setState({ requestFailed: true })
        this.setState({ message: "couldn't load more events.." })
      })
  }

  componentDidMount() {
    this.loadEvents(1)
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
          <Event content={item} key={i} listDelete={this.handleDelete.bind(this)} />
        ))}
      </tfoot>
        </table>
      </div>

    )
  }
}

export default EventsList;

/*<button onClick={this.loadEvents()}> Load more </button>*/
