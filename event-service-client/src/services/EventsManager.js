import objSort from './utils';

let config = require ('../config')
let server = config.SERVER_URL;


class EventsManager {

  constructor(){
    this.listConfig = {
      page: 1,
      locallySorted: false,
      pausePagination: false,
      filters: {
        type: null,
        serviceId: null
      }
    };
    this.events = [];
  }

  pop(eventId){
    //this is called by a socket event or by api delete
    let newEvents = this.events;
    let deleted_obj_index = newEvents.findIndex( (item) => { return item.id === eventId })
    if (deleted_obj_index > -1) {
      newEvents.splice(deleted_obj_index, 1);
      this.events = newEvents;
    }
  }


  push(eventObj){
    this.events.splice(0, 0, eventObj);
    if(this.listConfig.locallySorted) this.sortLocal();
  }

  delete(eventId, callback) {
    return fetch(`${server}/api/events/${eventId}`, {
      method: 'DELETE'
    }).then(response => {
      if (!response.ok){
        return callback('err', null)
      }
      //delete from events, this is commented as handled by sockets now.
      //popEvent(eventId);
      return callback(null, 'success');
    })
  }

  assignFilter(filters = {}, callback){
    let changed = false;
    for (const k of Object.keys(filters)){
      if (filters[k] !== null){
        this.listConfig.filters[k] = filters[k];
        changed = true;
      }
    }
    if (changed){
      return this.reload(callback);
    }
    return callback(false, false, 0); // no change
  }

  /* use reloads when new filters are applied */
  reload(callback){
    this.events = [];
    this.listConfig.page = 1;
    this.listConfig.pausePagination = false;
    return this.filter(callback);
  }


  /* Sort the already loaded events set, for UI sorting */
  sortLocal(sortBy){
    this.events = this.events.objSort(sortBy);
  }

  /* method for convinience and name convention */
  loadMore(callback){
    return this.filter(callback);
  }

  /* method for convinience and name convention */
  all(callback){
    return this.filter(callback);
  }
  /*
  callback (err, success, length_result), err & success are boolean switch
  eg. (false, true, 10) returned 10 events
  */

  filter(callback){
    if (this.listConfig.pausePagination) return;
    let fetchUrl = `${server}/api/events?page=${this.listConfig.page}`;

    if (this.listConfig.filters.type){
      fetchUrl += `&type=${this.listConfig.filters.type}`;
    }
    if (this.listConfig.filters.serviceId){
      fetchUrl += `&serviceId=${this.listConfig.filters.serviceId}`;
    }

    fetch(fetchUrl)
      .then(response => {
        if (!response.ok) {
          return callback(true, false, 0)
        }
        return response;
      })
      .then(d => d.json())
      .then(d => {

        if (!d.length){
          this.listConfig.pausePagination = true;
          return callback(false, true, 0);
        }
        //if we have too many events, remove the head events
        if (this.events.length >= 100){
          this.events = this.events.splice(0, 50);
        }
        this.events = this.events.concat(d);
        this.listConfig.page += 1;

        return callback(false, true, d.length);

      }, (err) => {
        return callback(true, false, 0);
      })
  }
}

export default EventsManager;
