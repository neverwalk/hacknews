import * as NodeCache from 'node-cache';

export class CacheService {
  static cache = new NodeCache({ stdTTL: 3600, checkperiod: 1200 });
  constructor() {}
}
