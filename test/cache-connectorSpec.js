/* global describe, expect, it, jasmine */

const CacheConnector = require('../src/connector');
const EventEmitter = require('events').EventEmitter;


const settings = {
  networkConfig: {
    addresses: [{
      host: process.env.HAZELCAST_HOST || 'localhost',
      port: process.env.HAZELCAST_PORT || 5701
    }],
    connectionTimeout: 1000,
    connectionAttemptLimit: 1
  },
  mapName: 'deepstreamCache'
};

const wrongSettings = {
  networkConfig: {
    addresses: [{
      host: 'thisdomaindoesnotexist',
      port: 5701
    }],
    connectionTimeout: 1000,
    connectionAttemptLimit: 1
  },
  mapName: 'deepstreamCache'
};

const MESSAGE_TIME = 20;


describe('the message connector has the correct structure', () => {
  var cacheConnector;

  it('throws an error if required connection parameters are missing', () => {
    expect(() => {
      new CacheConnector('gibberish');
    }).toThrow();

    expect(() => {
      new CacheConnector({});
    }).toThrow();
  });

  it('emits an error event if connection fails', (done) => {
    cacheConnector = new CacheConnector(wrongSettings);

    expect(cacheConnector.isReady).toBe(false);

    cacheConnector.on('ready', () => {
      fail("ready event should't have been called");
      done();
    });

    cacheConnector.on('error', done);
  });

  it('creates the cacheConnector', (done) => {
    cacheConnector = new CacheConnector(settings);

    expect(cacheConnector.isReady).toBe(false);

    cacheConnector.on('error', () => {
      fail("error event should't have been called");
      done();
    });

    cacheConnector.on('ready', () => {
      expect(cacheConnector.isReady).toBe(true);
      done();
    });
  });

  it('implements the cache/storage connector interface', () => {
    expect(typeof cacheConnector.name).toBe('string');
    expect(typeof cacheConnector.version).toBe('string');
    expect(typeof cacheConnector.get).toBe('function');
    expect(typeof cacheConnector.set).toBe('function');
    expect(typeof cacheConnector.delete).toBe('function');

    expect(cacheConnector instanceof EventEmitter).toBe(true);
  });

  it('retrieves a non existing value', (done) => {
    cacheConnector.get('someValue', (error, value) => {
      expect(error).toBe(null);
      expect(value).toBe(null);
      done();
    });
  });

  it('sets a value', (done) => {
    cacheConnector.set('someValue', { firstname: 'Wolfram' }, (error) => {
      expect(error).toBe(null);
      done();
    });
  });

  it('retrieves an existing value', (done) => {
    cacheConnector.get('someValue', (error, value) => {
      expect(error).toBe(null);
      expect(value).toEqual({ firstname: 'Wolfram' });
      done();
    });
  });

  it('deletes a value', (done) => {
    cacheConnector.delete('someValue', (error) => {
      expect(error).toBe(null);
      done();
    });
  });

  it("Can't retrieve a deleted value", (done) => {
    cacheConnector.get('someValue', (error, value) => {
      expect(error).toBe(null);
      expect(value).toBe(null);
      done();
    });
  });
});
