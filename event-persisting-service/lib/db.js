'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       This wrapper allows us to change the database engine later on if needed.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     */

var _couchbase = require('couchbase');

var _couchbase2 = _interopRequireDefault(_couchbase);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Database = function () {
  function Database() {
    _classCallCheck(this, Database);

    var host = process.env.COUCHBASE_HOST;
    this.bucketName = process.env.COUCHBASE_BUCKET_NAME;
    this.connection = new _couchbase2.default.Cluster(this.host).openBucket(this.bucketName);
    this.setupIndexes();

    return host;
  }

  _createClass(Database, [{
    key: 'setupIndexes',
    value: function setupIndexes() {
      /*
      we could probably create more sophisticated indexing, but CB takes care of query optimization
      since we're always running the same query.
      */
      var q = _couchbase2.default.N1qlQuery.fromString('CREATE PRIMARY INDEX ON ' + this.bucketName + ' USING GSI;');
      this.connection.query(q, function (err, res) {
        if (err) {
          //index already exists error codes, CB has two of them!
          if (err.code == 4300 || err.code == 5000) {
            return;
          }
          process.logger.error('unable to create query indexes, exiting app. ' + err);
          process.exit(1);
        }
        process.logger.info('Couchbase indexes created, ready to query');
      });
    }
  }, {
    key: 'store',
    value: function store(data, callback) {
      var documentId = _uuid2.default.v4();
      this.connection.upsert(documentId, data, function (error, result) {
        if (error) {
          process.logger.error('could not insert into database data, error ' + error);
          callback(error, null);
          return;
        }
        callback(null, { id: documentId, data: result });
      });
    }
  }, {
    key: 'deleteWithDocID',
    value: function deleteWithDocID(docId, callback) {
      this.connection.remove(docId, function (error, result) {
        if (error) {
          process.logger.error('could not delete with ID ' + docId + ', ' + error);
          if (error.code == 13) {
            error.code = 404;
          } //does not exist
          callback(error, null);
          return;
        }
        callback(null, { message: "success", data: result });
      });
    }
  }, {
    key: 'getByTypeAndServiceId',
    value: function getByTypeAndServiceId() {
      var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var serviceId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var sortKey = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var order = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'DESC';
      var offset = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
      var limit = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 50;
      var callback = arguments[6];


      //helper func, could be abstracted if needed later.
      var orEmpty = function orEmpty(entity) {
        return entity || "";
      };

      sortKey = sortKey || 'ts';
      var queryString = 'SELECT  META(' + this.bucketName + ').id, type, serviceId, data, ts FROM ' + this.bucketName;

      if (type && serviceId) {
        queryString += ' WHERE type = "' + type + '" AND serviceId = "' + serviceId + '"';
      } else if (type || serviceId) {
        queryString += orEmpty(type && ' WHERE type = "' + type + '"');
        queryString += orEmpty(serviceId && ' WHERE serviceId = "' + serviceId + '"');
      }

      process.logger.debug(queryString + (' ORDER BY ' + sortKey + ' ' + order + ' LIMIT 50 OFFSET ' + offset + ' ;'));
      var q = _couchbase2.default.N1qlQuery.fromString(queryString + ('  ORDER BY ' + sortKey + ' ' + order + '\n                  LIMIT ' + limit + ' OFFSET ' + offset + ';'));
      this.connection.query(q, callback);
    }
  }]);

  return Database;
}();

module.exports = Database;
