import React, { Component } from 'react';


class Event extends Component {

  render(){
    //incase data is a json object
    let dataVal = JSON.stringify(this.props.content.data);
    return (
      <tr key={this.props.content.id}>
        <td>{this.props.content.id}</td>
        <td>{this.props.content.type}</td>
        <td>{this.props.content.serviceId}</td>
        <td>{dataVal}</td>
        <td id={this.props.content.id} className='delete' onClick={this.props.handleDelete.bind(this)}>Delete Event</td>
      </tr>
    )
  }
}

export default Event; 
