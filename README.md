# deepstream.io-cache-hazelcast [![npm version](https://badge.fury.io/js/deepstream.io-cache-hazelcast.svg)](http://badge.fury.io/js/deepstream.io-cache-hazelcast) [![Build Status](https://travis-ci.org/deepstreamIO/deepstream.io-cache-hazelcast.svg?branch=master)](https://travis-ci.org/deepstreamIO/deepstream.io-cache-hazelcast)

[![Greenkeeper badge](https://badges.greenkeeper.io/deepstreamIO/deepstream.io-cache-hazelcast.svg)](https://greenkeeper.io/)

[deepstream](http://deepstream.io) cache connector for [hazelcast](http://hazelcast.org/)

This connector uses [the npm hazelcast-client package](https://www.npmjs.com/package/hazelcast-client).
Please have a look there for detailed options.

##Basic Setup

```yaml
plugins:
  cache:
    name: hazelcast
    options:
      networkConfig:
        addresses:
          - host: $HAZELCAST_HOST
            port: $HAZELCAST_PORT
```

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