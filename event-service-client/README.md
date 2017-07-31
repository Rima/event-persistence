### How to run
Setup the backend service URL in `src/config`.

then `npm run` will run the dev server.

### about
this is my first react app, previously the most I did was edit other people's code to add a feature
or solve a backend problem. so it took me a bit of time to get my head around React.
this uses `create-react-app` from facebook.


### How to improve
1. The services logic could probably be more decoupled.
2. The sockets logic could be moved to services perhaps.
3. We could use a datastore like Redux instead of loading the events with the component to improve performance.
4. Write some tests using `mocha` and `chai` to test services, then we'd be left with straight forward views
in components which could be tested with `Jest`.
