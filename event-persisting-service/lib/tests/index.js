'use strict';

var _message = require('../message');

var _message2 = _interopRequireDefault(_message);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

process.env.NODE_ENV = 'test';


var chai = require('chai');
var chaiHttp = require('chai-http');

var Server = require('../server');
var io = require('socket.io-client');

var server = new Server();

var should = chai.should();
chai.use(chaiHttp);

describe('Events', function () {
  /* use before and after instead of beforeEach as CB is async */
  before(function (done) {
    var msg = new _message2.default({
      "type": "process-event",
      "serviceId": "service-internal-notification",
      "data": "some data"
    });
    process.database.store(msg.content, function (err, succ) {
      if (succ) done();
      if (err) throw Error('unable to prepare test database ' + err);
    });
  });

  after(function (done) {
    process.database.flushDb();
    done();
  });

  it('should list ALL events on /api/events GET', function (done) {
    chai.request(server.server).get('/api/events').end(function (err, res) {
      res.should.have.status(200);
      res.should.be.json;
      res.body.should.be.a('array');
      res.body[0].should.have.property('id');
      res.body[0].should.have.property('serviceId');
      res.body[0].should.have.property('type');
      res.body[0].should.have.property('data');
      res.body[0].should.have.property('ts');

      res.body[0].serviceId.should.equal('service-internal-notification');
      res.body[0].type.should.equal('process-event');
      res.body[0].data.should.equal('some data');

      done();
    });
  });

  it('should delete a SINGLE event and broadcast it to connected sockets /api/event/<id> DELETE', function (done) {
    var options = {
      transports: ['websocket'],
      'force new connection': true
    };
    var client = io.connect(server.address, options);

    chai.request(server.server).get('/api/events').end(function (err, res) {
      var eventId = res.body[0].id;
      //this times out when it fails.
      client.on('event_deleted', function (msg) {
        msg.should.equal(eventId);
        client.disconnect();
        done();
      });
      chai.request(server.server).delete('/api/events/' + eventId).end(function (error, response) {
        response.should.have.status(202);
      });
    });
  });
});