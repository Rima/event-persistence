
## How to run
### installing couchbase
In order to run this app you need a Couchbase server running, see Couchbase.org for installing a CB server.
Make sure during setup/configuration to tick `Indexing` and `Querying`
Couchbase is ports hungry, make sure you have available ports to run it and all its depandant services
https://developer.couchbase.com/documentation/server/3.x/admin/Install/install-networkPorts.html
you can check what occupied ports you have by running
`sudo lsof -i -P -n | grep LISTEN`


### setting up the app
Once your database is up, install the app dependencies with `npm install`

In the `environment` file there's a list of `env` variables that need to be set to run this app
set them by either exporting them manually or `cp environment localenv` and modify `localenv`
then `source localenv`

then run the app in your terminal through the bin file
`./bin/run`

### Logging
If you don't define a logLevel the logLevel is set to default 'info'
If you don't define a logFile the app will log in the terminal, otherwise it'll stream logs to your logFile


## Stack

### Database
This uses Couchbase as a persistant storage as it's assumed this service requires high throughput
Couchbase offers robust writes/sec performance

We don't really need advanced querying so we could live with eventually consistent querying.
Async writes could be a huge advantage for dealing with events
the document nature allows us flexibility in defining new event data structures or allowing flexible event payload.


### Sockets library
We'll use sockets.io for the purpose of this exercise, as sockets 2.0 integrates Egnine.io as a new core
which solves a lot of the performance problems.

We could probably live with engine.io on its own for this service, as we don't really need rooms and all the fancy stuff
socket.io adds or even we could even just use straight up WS. But this decision is better made in context.

https://github.com/socketio/engine.io


## How can this code be improved
Instead of doing hijacked type checking in the api routes, we could use a static type checker
https://flow.org
https://www.npmjs.com/package/flow-validator

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
then we could validate it with the flow `.validate()` or run a switch loop based on the received content


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
