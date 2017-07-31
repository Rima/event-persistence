### How to run
Setup the backend service URL in `src/config`.

then `npm run` will run the dev server.

### about
this is my first react app, previously the most I did was edit other people's code to add a feature
or solve a backend problem. so it took me a bit of time to get my head around React.
this uses `create-react-app` from facebook.


### How to improve
Components are stateless in exception to the root container (App), this will make unit testing and code structure a lot more scalable and readable.

1. The services logic could probably be more decoupled.
2. The sockets logic could be moved to services perhaps.
3. We could use a datastore like Redux instead of loading the events with the component to improve performance.
4. Write some tests using `mocha` and `chai` to test services, then we'd be left with pretty much html views
in components which could be if needed tested with `Jest`.
5. The UI is pretty ugly as it stands :) as no time was invested in CSS - add some eye candy. 

### Unimplemented methods
The EventsManager service handles operations on events, it has a localsorting method, which allows the UI to sort currently loaded events. However, this method is not implemented in components  at the moment - could implement following the same pattern as filters.
