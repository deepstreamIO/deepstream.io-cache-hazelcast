"use strict";

const EventEmitter = require('events').EventEmitter;
const pkg = require('../package.json');
const hazelcast = require('hazelcast-client');


function isObject(val) {
  return val != null && typeof(val) === 'object' && val.constructor !== Array;
}


/**
 * A [deepstream](http://deepstream.io) cache connector class
 * for [hazelcast](http://hazelcast.org/)
 *
 * @extends EventEmitter
 */
class Connector extends EventEmitter {
  /**
   * @param {Object} options A map of connection parameters, i.e.
   *
   * {
   *    host: <Number>
   *    port: <String>
   *    [serverName]: <String> //optional
   *    [password]: <String> //optional
   * }
   */
  constructor(options) {
    super();

    options = options || {};

    this.isReady = false;
    this.name = pkg.name;
    this.version = pkg.version;

    this._validateOptions(options);

    const config = new hazelcast.Config.ClientConfig();

    config.properties['hazelcast.logging'] = {
      log: this._hazelcastLogger.bind(this)
    };

    this._populateConfig(config, options);

    this.client = new hazelcast.Client(config);

    this.client.connectionManager.on('connectionClosed', () => {
      console.log('connectionClosed !!!')
    })

    this.client.init().then((client) => {
      this.isReady = true;
      this.map = client.getMap(options.mapName);
      this.emit('ready');
    }).catch(this._emitError.bind(this));
  }

  /**
   * Writes a value to the cache.
   *
   * @param {String}   key
   * @param {Object}   value
   * @param {Function} callback Should be called with null for successful set operations or with an error message string
   *
   * @private
   * @returns {void}
   */
  set(key, value, callback) {
    this.map.put(key, value).then(() => {callback(null)}).catch(callback);
  }

  /**
   * Retrieves a value from the cache
   *
   * @param {String}   key
   * @param {Function} callback Will be called with null and the stored object
   *                            for successful operations or with an error message string
   *
   * @private
   * @returns {void}
   */
  get(key, callback) {
    this.map.get(key).then((res) => {callback(null, res)}).catch(callback);
  }

  /**
   * Deletes an entry from the cache.
   *
   * @param   {String}   key
   * @param   {Function} callback Will be called with null for successful deletions or with
   *                     an error message string
   *
   * @private
   * @returns {void}
   */
  delete(key, callback) {
    this.map.remove(key).then(() => {callback(null)}).catch(callback);
  }

  _emitError(error) {
    this.emit('error', `HAZELCAST error: ${error}`);
  }

  _populateConfig(config, options) {
    for(let key in config) {
      if(!config.hasOwnProperty(key)) {
        continue;
      }

      if(isObject(config[key])) {
        if(isObject(options[key])) {
          this._populateConfig(config[key], options[key]);
        }
      }
      else if (options[key] !== undefined) {
        config[key] = options[key];
      }
    }
  }

  _validateOptions(options) {
    if(!isObject(options)) {
      throw new Error("options should be an object");
    }

    if(!options.mapName) {
      throw new Error("Missing option 'mapName' for hazelcast-connector");
    }
  }

  _hazelcastLogger(level, className, message, furtherInfo) {
    // https://github.com/hazelcast/hazelcast-nodejs-client/blob/master/src/LoggingService.ts#L4
    const logLevel = ['ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE']

    // Hazelcast will only send a `WARN` on connection failure,
    // so we look out for the warnings as well:
    if(level <= logLevel.indexOf('WARN')) {
      // Let deepstream know that the client has disconnected:
      if(className === 'ClientConnection') {
        this.emit('error', 'disconnected');
      }

      // Emit error message:
      let error = `${logLevel[level]} at ${className}: ${message}`;
      if(furtherInfo) {
        error += `\n${furtherInfo}`;
      }

      this._emitError(error);
    }
  }
}


module.exports = Connector;
