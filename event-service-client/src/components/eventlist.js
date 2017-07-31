import React, { Component } from 'react';

import Event from './event';

class EventList extends Component {

  render(){
    if (!this.props.events) return <p>Loading...</p>
    return (
        <div className='events'>
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
        {this.props.events.map((item, i) => (
          <Event content={item} key={i} handleDelete={this.props.handleDelete} />
        ))}
      </tfoot>
        </table>

        <button disabled={this.props.pausePagination} onClick={this.props.loadMore}> Load more </button>
      </div>

    )
  }
}

export default EventList;
