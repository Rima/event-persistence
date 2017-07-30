const express = require ('express');
import Message from './message'
let api  = express.Router();

api.post('/events', (req, res) => {

  let msg = new Message(req.body);
  if (msg.content === null){
    res.status(422).send({error: "message_type_unrecognized"})
    return;
  }
  process.database.store(msg.content, (err, result) => {
    if (err){
      res.status(500).send({error: "internal_error"})
      return;
    }
    let content = msg.content;
    content['id'] = result['id'];
    process.socketshandle.emit('event_new', content);
    res.status(201).json({success: true})
  });

});

api.get('/events', (req, res) => {
  let type = req.query.type;
  let serviceId = req.query.service_id;
  let limit = req.query.limit || 1;
  let page = (req.query.page || 1);
  let sortKey = req.query.sort_by || 'ts';
  let order = req.query.order || 'DESC';

  let offset = limit * (page-1);

  process.database.getByTypeAndServiceId( type, serviceId, sortKey, order, offset, limit, (err, results) => {
    if (err){
      res.status(500).send({error: "internal_error"})
      return;
    }
    res.send(results);
  });
});


api.delete('/events/:id', (req, res) => {
  let docId = req.params.id;

  process.database.deleteWithDocID(docId, (err, results) => {
    if (err){
      if (err.code == 404){
        res.status(404).send({error: "does_not_exist"})
        return;
      }
      res.status(500).send({error: "internal_error"})
      return;
    }
    process.socketshandle.emit('event_deleted', docId);
    res.status(204).json({success: true})
  });

});

module.exports = api;
