import * as NodeCache from 'node-cache';

export class CacheService {
  static cache = new NodeCache({ stdTTL: 1200, checkperiod: 1200 });
  constructor() {}
}
