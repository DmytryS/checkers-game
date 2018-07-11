'use strict';
import path from 'path';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import express from 'express';
import config from '../etc/config';
import routes from './routes';
import logger from './logger';

class Service {
    constructor(configForTests) {
        this._logger = logger.getLogger('Service');
        this._config = configForTests || config;
        this._db = null;
        this._app = null;
    }

    start() {
        this._app = new express();

        this._app.set('views', path.join(process.cwd(), 'views'));
        this._app.set('view engine', 'jade');

        this._app.use(express.json());
        this._app.use(express.urlencoded({ extended: false }));
        this._app.use(cookieParser());
        this._app.use(express.static(path.join(process.cwd(), 'public')));
        
        this._app.use(this._config.baseUrl, routes.Api);
        this._app.use('/', routes.Front);

        this._db = this._connectDatabase();
        this._db.on('error', (err) => this._logger.error(`Mongoose connection error: ${err}`));
        this._db.once('open', () => this._logger.info('Succesfully connected to db'));

        this._app.listen(this._config.port, () => {
            this._logger.info(`App listening on port ${this._config.port}`);
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
        mongoose.connect(this._config.db.url, { useNewUrlParser: true });
        return mongoose.connection;
    }
}

export default new Service().start();