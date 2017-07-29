'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var log = require('log');
var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var api = require('./api');
var db = require('./db');

/*
This class simply allows us to contain the server and makes it easier
to enable/disable or replace certain parts of the app. like sockets.
*/

var Server = function () {
  function Server() {
    _classCallCheck(this, Server);

    this.bindAdress = process.env.BIND_ADDRESS || '0.0.0.0';
    this.port = process.env.PORT || '8080';
    this.serviceName = process.env.SERVICE_NAME || 'event-manager';
    this.logLevel = process.env.LOG_LEVEL || 'info';
    this.logFile = process.env.LOG_FILE_ADDRESS;
    var stream = null;

    if (this.logFile !== undefined && this.logFile !== null) {
      var _stream = fs.createReadStream(LOG_FILE_ADDRESS);
    }
    var logger = new log(this.logLevel, stream);

    process.logger = logger;

    this.setupExpress();
    this.setupDatabase();
    this.setupSockets();
  }

  _createClass(Server, [{
    key: 'setupExpress',
    value: function setupExpress() {
      var _this = this;

      var app = express();

      app.use(function (req, res, next) {
        res.setHeader('X-Served-By', 'service/' + _this.serviceName);
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.setHeader("Access-Control-Allow-Methods", "POST, GET, DELETE");
        next();
      });

      app.use(bodyParser.json()); // for parsing application/json

      app.use('/api', api);

      app.listen(this.port, this.bindAdress, function () {
        process.logger.info('server is up on ' + _this.bindAdress + ':' + _this.port);
      });

      app.locals.title = this.serviceName;
      //time is probably relevant given this is an event service
      //app.locals.strftime = require('strftime');

      this.app = app;
    }
  }, {
    key: 'setupSockets',
    value: function setupSockets() {
      process.logger.info("sockets are up");
    }
  }, {
    key: 'setupDatabase',
    value: function setupDatabase() {
      process.database = new db();
      process.logger.info('database is up');
    }
  }]);

  return Server;
}();

module.exports = Server;
