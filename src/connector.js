"use strict";

const EventEmitter = require('events').EventEmitter;
const pkg = require('../package.json');
const hazelcast = require('hazelcast-client');

function isObject(val) {
  return val != null && typeof(val) === 'object' && val.constructor !== Array
}

/**
 * A [deepstream](http://deepstream.io) cache connector class
 * for [hazelcast](http://hazelcast.org/)
 *
 * @author Arnar Yngvason
 * @copyright 2016 deepstream.io
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
    this._populateConfig(config, options);

    hazelcast.Client.newHazelcastClient(config).then((client) => {
      this.isReady = true;
      this.client = client.getMap(options.mapName);
      this.emit('ready');
    }).catch(this._emitError.bind(this));

    // TESTME:
    config.listeners.lifecycle.push((event) => {
      if(event === 'clinet_disconnected') {
        this.emit('error', 'disconnected')
      }
    })
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
    this.client.put(key, value).then(() => {callback(null)}).catch(callback);
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
    this.client.get(key).then((res) => {callback(null, res)}).catch(callback);
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
    this.client.remove(key).then(() => {callback(null)}).catch(callback);
  }

  _emitError(error) {
    this.emit('error', `HAZELCAST error: ${error}`);
  }

  _populateConfig(config, options) {
    for(let key in config) {
      if(!config.hasOwnProperty(key))
        continue;

      if(isObject(config[key])) {
        if(isObject(options[key])) {
          this._populateConfig(config[key], options[key])
        }
      }
      else if (options[key] !== undefined) {
        config[key] = options[key]
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
}


module.exports = Connector;
