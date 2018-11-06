import redis from 'redis';
import log4js from 'log4js';
import bluebird from 'bluebird';
import config from '../../../config/config';

bluebird.promisifyAll(redis);

/**
 * Redis client class
 */
export class RedisClient {
    /**
     * Constructs redis client
     * @param {Object} config config
     */
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

    /**
     * Gets data by key
     * @param {String} key target key
     * @returns {Promise} Returns promise which will be resolved when got redis data
     */
    async getByKey(key) {
        const res = await this._redisClient.getAsync(key);

        return JSON.parse(res);
    }

    /**
     * Gets all data
     * @returns {Promise} Returns promise which will be resolved when data retrieved
     */
    async getAll() {
        const res = await this._redisClient.hgetallAsync();

        return res.map((item) => JSON.parse(item));
    }

    /**
     * Sets data by key
     * @param {String} key target key
     * @param {String} data data to set
     * @returns {Promise} Returns promise which will be resolved when data set
     */
    set(key, data) {
        return this._redisClient.setAsync(key, JSON.stringify(data));
    }

    /**
     * Deletes data by key
     * @param {String} key target key
     * @returns {Promise} Returns promise which will be resolved when data deleted
     */
    delete(key) {
        return this._redisClient.delAsync(key);
    }

    /**
     * Check if key exists
     * @param {String} key target key
     * @returns {Promise} Returns promise which will be resolved when got result
     */
    exists(key) {
        return this._redisClient.existsAsync(key);
    }
}

export default new RedisClient(config);
