# deepstream.io-cache-hazelcast [![npm version](https://badge.fury.io/js/deepstream.io-cache-hazelcast.svg)](http://badge.fury.io/js/deepstream.io-cache-hazelcast)

[deepstream](http://deepstream.io) cache connector for [hazelcast](http://hazelcast.org/)

This connector uses [the npm hazelcast-client package](https://www.npmjs.com/package/hazelcast-client).
Please have a look there for detailed options.

##Basic Setup
```javascript
const Deepstream = require('deepstream.io');
const HazelcastCacheConnector = require('deepstream.io-cache-hazelcast');
const server = new Deepstream();

server.set('cache', new HazelcastCacheConnector({
  networkConfig: {
    addresses: [{
      host: 'localhost',
      port: 5701
    }]
  },
  mapName: 'deepstreamCache'
}));

server.start();
```
