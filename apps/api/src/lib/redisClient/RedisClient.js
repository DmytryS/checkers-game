import redis from 'redis';
import log4js from 'log4js';
import config from '../../../config/config';

export class RedisClient {
    constructor(configuration) {
        this._config = configuration;
        this._logger = log4js.getLogger('RedisClient');
        this._redisClient = redis.createClient(this._config.redis.port, this._config.redis.host);

        this._redisClient.on('connect', this._onConnect.bind(this));
        this._redisClient.on('error', this._onError.bind(this));
    }

    _onConnect() {
        this._logger.info('Connected to redis');
    }

    _onError(err) {
        this._logger.error(err);
    }
}

export default new RedisClient(config);
