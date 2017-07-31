
## How to run
### Installing Couchbase
In order to run this app you need a Couchbase server running, download and unpack couchbase from couchbase.com
https://www.couchbase.com/downloads

or with docker

`docker pull couchbase/server`

then

`docker run -d --name db -p 8091-8094:8091-8094 -p 11210:11210 couchbase`

then

visit `http://localhost:8091`


During setup ensure:
1.  tick `Indexing` and `Querying`
2.  You setup enough RAM for the cluster for 2 buckets (test bucket and development bucket)
3.  When setting up the test bucket ensure you enable `flush` command so we can empty the bucket when running tests.

Couchbase is ports hungry, make sure you have available ports to run it and all its depandant services
https://developer.couchbase.com/documentation/server/3.x/admin/Install/install-networkPorts.html

you can check what occupied ports you have by running
`sudo lsof -i -P -n | grep LISTEN`


### Setting up the app
Once your database is up, install the app dependencies with `npm install`

In the `environment` file there's a list of `env` variables that need to be set to run this app
set them by either exporting them manually or `cp environment localenv` and modify `localenv`
then `source localenv`

then run the app in your terminal through the bin file
`./bin/run`

Having the bin file allows for additional configurations. Right now it just runs the server.

### Logging
If you don't define a logLevel the logLevel is set to default 'info'
If you don't define a logFile the app will log in the terminal, otherwise it'll stream logs to your logFile

Accepted log levels: debug, info and error.

### Running tests
To run test you need to have node `Mocha` installed. then you can run
`mocha lib/tests/`

When you run tests, `NODE_ENV` environment variable is switched to `test`

Make sure you have the test bucket defined in the environment variable.
In the code flushing a bucket is only enabled when working in test environment, as it's a dangerous operation to enable otherwise.
You could also disable bucket flushing through the cluster manager (as per notes in the db setup).

Currently there are only two test cases testing http GET, Delete and Sockets, this could improve to add a bunch more.

## Stack

### Why Couchbase
This uses Couchbase as a persistant storage as it's assumed this service requires high throughput
Couchbase offers robust writes/sec performance

We don't really need advanced querying so we could live with eventually consistent querying.
Async writes could be a huge advantage for dealing with events
the document nature allows us flexibility in defining new event data structures or allowing flexible event payload.


### Sockets library
We'll use sockets.io for the purpose of this exercise, as sockets 2.0 integrates Egnine.io as a new core
which solves a lot of the performance problems.

We could probably live with engine.io on its own for this service, as we don't really need rooms and all the fancy stuff
socket.io adds or even we could just use straight up WS.

https://github.com/socketio/engine.io


## How can this code be improved
Instead of doing hijacked type checking in the api routes, we could use a type declaration and validation library, flow has a run-time library for type checking

https://flow.org
https://codemix.github.io/flow-runtime/#/

We would create src/message.js and in it we would define our allowed message types:
```
type DeepMessageType = {
  'type': string,
  serviceId: string,
  data: Map<string, string>
};
type ShallowMessageType = {
  'type': string,
  serviceId: string,
  data: string
};
```
then we could validate it with the flow `.accept()` or run a switch loop based on the received content


We could also use a schema and indexing library for Couchbase `ottoman ODM` seems to do the job
https://blog.couchbase.com/firstapp-couchbase-nodejs-ottoman/

also using an ODM could potentially help us get rid of the hardcoded query under db.js

For now I'm sticking with less libraries to avoid additional overhead.

The setup could also be dockerized

## How to edit the code
edit src/...
then compile with babel-cli

in your terminal
`$(npm bin)/babel src --out-dir lib`

or a particular file
`$(npm bin)/babel src/{{filename}} --out-file lib/{{filename}}`

## Pagination and Querying
under `src/api.js:get` you'll see the parameters accepted and implemented for querying the service over `GET`.
by default number of entries per page is set to 2.

This is designed to work in the `load More` fashion, check the client app
to see the implementation. We could return instead total number of entries in a
bucket but we'd want to cache that value, instead of querying the bucket full count
everytime - also it's important to bear in mind that Couchbase querying is
eventually consistent. 

## General design notes
Assuming this service purpose is to provide an event sourcing mechanism where it acts as both message broker and
message store, as a fail safe mechanism for services.
ie if A service goes offline for x time, when it comes back up it can recover any messages it missed out -
or even as a system state replay mechanism - ie reconstruct objects from an event trail.

It's common to use Kafka https://kafka.apache.org/ for this purpose because it acts as both message broker and persistant storage.
but since the message broker is out of our scope here - it made sense to use something like Couchbase.
