process.env.NODE_ENV = 'test';
import Message from '../message'

const chai = require('chai');
const chaiHttp = require('chai-http');

const Server = require('../server');
const io     = require('socket.io-client');

const server = new Server();

const should = chai.should();
chai.use(chaiHttp);


describe('Events', () => {
    /* use before and after instead of beforeEach as CB is async */
    before( (done) => {
      let msg = new Message({
        "type" : "process-event",
        "serviceId" : "service-internal-notification",
        "data" : "some data"
      });
      process.database.store(msg.content, (err, succ) => {
        if (succ) done();
        if (err) throw Error(`unable to prepare test database ${err}`);
      });
    });

    after( (done) => {
      process.database.flushDb();
      done();
    });


  it('should list ALL events on /api/events GET', (done) => {
    chai.request(server.server)
      .get('/api/events')
      .end((err, res) => {
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

  it('should delete a SINGLE event and broadcast it to connected sockets /api/event/<id> DELETE', function(done) {
    let options = {
          transports: ['websocket'],
          'force new connection': true
        };
    let client = io.connect(server.address, options);
    let got_event = true;

    chai.request(server.server)
      .get('/api/events')
      .end((err, res) => {
        let eventId = res.body[0].id;
        //this times out when it fails.
        client.on('event_deleted', (msg) => {
          msg.should.equal(eventId);
          client.disconnect();
          done();
        });
        chai.request(server.server)
          .delete('/api/events/'+eventId)
          .end((error, response) => {
            response.should.have.status(204);
        });
      });
  });

});
