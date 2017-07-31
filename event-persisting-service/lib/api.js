'use strict';

var _message = require('./message');

var _message2 = _interopRequireDefault(_message);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var express = require('express');

var api = express.Router();

api.post('/events', function (req, res) {

  var msg = new _message2.default(req.body);
  if (msg.content === null) {
    res.status(422).send({ error: "message_type_unrecognized" });
    return;
  }
  process.database.store(msg.content, function (err, result) {
    if (err) {
      res.status(500).send({ error: "internal_error" });
      return;
    }
    var content = msg.content;
    content['id'] = result['id'];
    process.socketshandle.emit('event_new', content);
    res.status(201).json({ success: true });
  });
});

api.get('/events', function (req, res) {
  var type = req.query.type;
  var serviceId = req.query.serviceId;
  var limit = req.query.limit || 2;
  var page = req.query.page || 1;
  var sortKey = req.query.sortBy || 'ts';
  var order = req.query.order || 'DESC';

  var offset = limit * (page - 1);

  process.database.getByTypeAndServiceId(type, serviceId, sortKey, order, offset, limit, function (err, results) {
    if (err) {
      res.status(500).send({ error: "internal_error" });
      return;
    }
    res.send(results);
  });
});

api.delete('/events/:id', function (req, res) {
  var docId = req.params.id;

  process.database.deleteWithDocID(docId, function (err, results) {
    if (err) {
      if (err.code == 404) {
        res.status(404).send({ error: "does_not_exist" });
        return;
      }
      res.status(500).send({ error: "internal_error" });
      return;
    }
    process.socketshandle.emit('event_deleted', docId);
    res.status(204).json({ success: true });
  });
});

module.exports = api;