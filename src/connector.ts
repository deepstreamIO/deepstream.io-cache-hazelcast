import * as  pkg from '../package.json'
import { Client, Config, IMap } from 'hazelcast-client'
import HazelcastClient from 'hazelcast-client/lib/HazelcastClient'
import { DeepstreamPlugin, DeepstreamCache, StorageReadCallback, StorageWriteCallback, StorageHeadBulkCallback, StorageHeadCallback, DeepstreamServices, DeepstreamConfig, EVENT } from '@deepstream/types'
import { JSONObject } from '@deepstream/protobuf/dist/types/all';

interface HazelcastConfig {
  mapName: string
}

/**
 * A [deepstream](http://deepstream.io) cache connector class
 * for [hazelcast](http://hazelcast.org/)
 */
export class Connector extends DeepstreamPlugin implements DeepstreamCache {
  public description = `Hazelcast connector ${pkg.version}`
  private logger = this.services.logger.getNameSpace('HAZELCAST_CACHE')
  private config: Config.ClientConfig
  private hazelcastClient!: HazelcastClient
  private map!: IMap<string, JSONObject>

  constructor (private options: HazelcastConfig, private services: DeepstreamServices, deepstreamConfig: DeepstreamConfig) {
    super()

    if (!this.options.mapName) {
      this.logger.fatal(EVENT.ERROR, "Missing option 'mapName' for hazelcast-connector")
    }

    this.config = new Config.ClientConfig()
    this.config.properties['hazelcast.logging'] = {
      warn: () => {},
      error: () => {},
      trace: () => {},
      log: () => {},
      info: () => {},
      debug: () => {}
    }
  }

  public async whenReady () {
    this.hazelcastClient = await Client.newHazelcastClient(this.config)
    this.map = await this.hazelcastClient.getMap(this.options.mapName)
  }

  public head (recordName: string, callback: StorageHeadCallback): void {
  }

  public headBulk (recordNames: string[], callback: StorageHeadBulkCallback): void {
  }

  public deleteBulk (recordNames: string[], callback: StorageWriteCallback, metaData?: any): void {
  }

  public set (recordName: string, version: number, data: any, callback: StorageWriteCallback, metaData?: any): void {
    this.map
      .put(recordName, data)
      .then(() => callback(null))
      .catch(callback)
  }

  public get (recordName: string, callback: StorageReadCallback, metaData?: any): void {
    this.map
      .get(recordName)
      .then((res: JSONObject) => callback(null, res || null))
      .catch(callback)
  }

  public delete (recordName: string, callback: StorageWriteCallback, metaData?: any): void {
    this.map.remove(key)
        .then(() => callback(null))
        .catch(callback)
  }

  /**
   * (https://github.com/hazelcast/hazelcast-nodejs-client/blob/master/src/DefaultLogger.ts)
   */
  private hazelcastLogger (level: number, className: string, message: string, furtherInfo: string) {
    // https://github.com/hazelcast/hazelcast-nodejs-client/blob/master/src/LoggingService.ts#L4
    const logLevel = ['ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE']

    // Hazelcast will only send a `WARN` on connection failure,
    // so we look out for the warnings as well:
    if (level <= logLevel.indexOf('WARN')) {
      // Let deepstream know that the client has disconnected:
      if (className === 'ClientConnection') {
        this.logger.fatal(EVENT.ERROR, 'Hazelcast client disconnected')
      }
    }
  }
}

export default Connector
