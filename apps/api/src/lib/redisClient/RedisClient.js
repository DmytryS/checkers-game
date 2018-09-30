import redis from 'redis';

export default class RedisClient {
    constructor(config) {
        this._config = config;
        this._redis = redis.createClient(this._config.redis.port, this._config.redis.host);
    }
}