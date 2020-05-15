import * as NodeCache from 'node-cache';

export class CacheService {
  static cache = new NodeCache( { stdTTL: 100, checkperiod: 120 } );
  constructor() {
  }
}
