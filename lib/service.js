'use strict';
import log4js from 'log4js';
import mongoose from 'mongoose';
import express from 'express';
import config from '../etc/config';
import routes from './routes';

class Service {
    constructor(configForTests) {
        this._logger = log4js.getLogger('Service');
        this._logger.level = 'debug';
        this._config = configForTests || config;
        this._db = null;
        this._app = null;
    }

    start() {
        this._app = new express();
        this._app.use(this._config.baseUrl, routes.Api);
        this._app.use('/', routes.Front);

        this._db = this._connectDatabase();
        this._db.on('error', (err) => this._logger.error(`Mongoose connection error: ${err}`));
        this._db.once('open', () => this._logger.debug('Succesfully connected to db'));

        this._app.listen(this._config.port, () => {
            this._logger.debug(`App listening on port ${this._config.port}`);
        });

        process.on('uncaughtException', (err) => {
            this._logger.error('Unhandled exception', err);
          });
        process.on('unhandledRejection', (err) => {
            this._logger.error('Unhandled rejection', err);
        });
    }

    stop() {
        this._db.close();
    }

    _connectDatabase() {
        mongoose.connect(this._config.db.url);
        return mongoose.connection;
    }
}

export default new Service().start();