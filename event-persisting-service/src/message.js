/*
we don't really need to validate message types as we have a doc store
but we might want it so we don't just pass anything that comes in the door
to our event storage
*/
class Message{
  constructor(message){
    if (message.type === undefined || message.type === null){
      this.content = null
      return
    }
    if (message.serviceId === undefined || message.serviceId === null){
      this.content = null
      return
    }
    if (message.data === undefined || message.data === null){
      this.content = null
      return
    }

    //strict msg type & add ts
    this.content = {
      type : message.type,
      serviceId : message.serviceId,
      data : message.data,
      ts : Date.now()
    }
  }

}
module.exports = Message;
