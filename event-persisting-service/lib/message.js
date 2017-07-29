"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
we don't really need to validate message types as we have a doc store
but we might want it so we don't just pass anything that comes in the door
to our event storage
*/
var Message = function Message(message) {
  _classCallCheck(this, Message);

  if (message.type === undefined || message.type === null) {
    this.content = null;
    return;
  }
  if (message.serviceId === undefined || message.serviceId === null) {
    this.content = null;
    return;
  }
  if (message.data === undefined || message.data === null) {
    this.content = null;
    return;
  }

  //strict msg type and TODO add a ts to the message 
  this.content = {
    type: message.type,
    serviceId: message.serviceId,
    data: message.data
  };
};

module.exports = Message;