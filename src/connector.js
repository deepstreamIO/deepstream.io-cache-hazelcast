"use strict";

const EventEmitter = require('events').EventEmitter;
const util = require('util');
const pkg = require('../package.json');


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
    this.isReady = false;
    this.name = pkg.name;
    this.version = pkg.version;
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

  }
}


module.exports = Connector;
