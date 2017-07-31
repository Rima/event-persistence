/*
  This wrapper allows us to change the database engine later on if needed.
*/

import couchbase from 'couchbase'
import uuid from 'uuid'

class Database {

  constructor(){
    this.testEnv = process.env.NODE_ENV === 'test';
    const host = process.env.COUCHBASE_HOST;
    this.bucketName = this.testEnv ? process.env.COUCHBASE_BUCKET_NAME_TEST : process.env.COUCHBASE_BUCKET_NAME;
    this.connection = new couchbase.Cluster(this.host).openBucket(this.bucketName);
    this.setupIndexes();

    return host;
  }

  setupIndexes(){
    /*
    we could probably create more sophisticated indexing, but CB takes care of query optimization
    since we're always running the same query.
    */
    let q = couchbase.N1qlQuery.fromString(`CREATE PRIMARY INDEX ON ${this.bucketName} USING GSI;`);
    this.connection.query(q, (err, res) => {
      if (err){
        //index already exists error codes, CB has two of them!
        if (err.code == 4300 || err.code == 5000){
          return;
        }
        process.logger.error(`unable to create query indexes, exiting app. ${err}`);
        process.exit(1);
      }
      process.logger.info ('Couchbase indexes created, ready to query')
    });
  }

  store(data, callback){
    let documentId = uuid.v4()
    this.connection.upsert(documentId, data, (error, result) => {
        if(error) {
            process.logger.error(`could not insert into database data, error ${error}`);
            callback(error, null);
            return;
        }
        callback(null, {id: documentId, data: result});
    });
  }

  deleteWithDocID(docId, callback){
    this.connection.remove(docId, (error, result) => {
        if(error) {
            process.logger.error(`could not delete with ID ${docId}, ${error}`);
            //does not exist - change to a known error code not to expose CB's laundry
            if (error.code == 13){ error.code = 404 }
            callback(error, null);
            return;
        }
        callback(null, {message: "success", data: result});
    });
  }

  getByTypeAndServiceId(type = null, serviceId = null, sortKey = null, order = 'DESC', offset = 0, limit=50, callback){

      //helper func, could be abstracted if needed later.
      const orEmpty = ( entity ) => {
          return entity || "";
      };

      sortKey = sortKey || 'ts';
      let queryString = `SELECT  META(${this.bucketName}).id, type, serviceId, data, ts FROM ${this.bucketName}`;

      if(type && serviceId){
        queryString += ` WHERE type = "${type}" AND serviceId = "${serviceId}"`;
      }else if (type || serviceId) {
        queryString += orEmpty(type && ` WHERE type = "${type}"`);
        queryString += orEmpty(serviceId && ` WHERE serviceId = "${serviceId}"`);
      }

      process.logger.debug(queryString  + ` ORDER BY ${sortKey} ${order} LIMIT 50 OFFSET ${offset} ;`);
      let q = couchbase.N1qlQuery.fromString(queryString  + `  ORDER BY ${sortKey} ${order}
                  LIMIT ${limit} OFFSET ${offset};`);
      this.connection.query(q, callback);
  }

  /* this is only enabled in test environment */
  flushDb(){
    if (!this.testEnv){return null;}
    let bucketMgr = this.connection.manager();
    bucketMgr.flush((err, succ) => {
      //do nothing
    });
  }

}

module.exports = Database;
