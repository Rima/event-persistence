const log = require('log')
const fs = require('fs')
const express = require('express')
const bodyParser = require('body-parser')
const api = require('./api')
const db = require('./db')
const ws = require('socket.io');

/*
This class simply allows us to contain the server and makes it easier
to enable/disable or replace certain parts of the app. like sockets.
*/

class Server{

  constructor(){
    this.bindAdress = process.env.BIND_ADDRESS || '0.0.0.0';
    this.port = process.env.PORT || '8080';
    this.serviceName = process.env.SERVICE_NAME || 'event-manager';
    this.logLevel = process.env.LOG_LEVEL || 'info';
    this.logFile = process.env.LOG_FILE_ADDRESS;
    let stream = null;

    if (this.logFile !== undefined && this.logFile !== null){
      const stream = fs.createReadStream(LOG_FILE_ADDRESS)
    }
    const logger = new log(this.logLevel, stream);

    process.logger = logger;

    this.setupExpress()
    this.setupDatabase()
    this.setupSockets()
  }

  setupExpress(){
    const app = express()

    app.use ( (req, res, next) => {
      res.setHeader ('X-Served-By', `service/${this.serviceName}`)
      res.setHeader ("Access-Control-Allow-Origin", "*");
      res.setHeader ("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      res.setHeader ("Access-Control-Allow-Methods", "POST, GET, DELETE, OPTIONS")
      next()
    });

    app.use(bodyParser.json()); // for parsing application/json

    app.use('/api', api)

    this.address = '';
    let server = app.listen(this.port, this.bindAdress, () => {
      process.logger.info(`server is up on ${this.bindAdress}:${this.port}`);
      //TODO find the protocol from expressjs obj.
      this.address = `http://${this.bindAdress}:${this.port}`;
    })

    app.locals.title = this.serviceName;

    this.app = app
    this.server = server
  }

  setupSockets(){
    let io = ws(this.server, { origins: '*:*'});

    io.on('connection', (socket) => {
      socket.emit('init', { hello: 'world' });
    });
    process.socketshandle = io;
    process.logger.info("sockets are up");
  }

  setupDatabase(){
    process.database = new db()
    process.logger.info(`database is up`)
  }
}


module.exports = Server;
