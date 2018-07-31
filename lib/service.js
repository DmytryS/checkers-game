'use strict';
import path from 'path';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import express from 'express';
import config from '../etc/config';
import routes from './routes';
import logger from './logger';

export default class Service {
    constructor() {
        this._logger = logger.getLogger('Main Service');
        this._db = null;
        this._app = null;
    }

    start(configForTests) {
        this._config = configForTests || config;
        this._app = new express();

        this._app.use(express.json());
        this._app.use(express.urlencoded({ extended: false }));
        this._app.use(cookieParser());
        this._app.use(this._config.baseUrl, routes.api);
        this._app.use(this._onError.bind(this));

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

    get server () {
        return this._app;
    }

    _onError(err, req, res, next) {

        if (error.syscall !== 'listen') {
            throw error;
        }
      
        const bind = typeof port === 'string'
            ? 'Pipe ' + port
            : 'Port ' + port;
      
        switch (error.code) {
            case 'EACCES':
                this._logger.error(bind + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                this._logger.error(bind + ' is already in use');
                process.exit(1);
                break;
            default:
            this._logger.error('Request error ', err);
            res.status(err.status || 500);
    
            res.send({
                error: err.name,
                message: err.message,
                details: err.details
            });
        }

        
      }

    _connectDatabase() {
        mongoose.connect(this._config.db.url, { useNewUrlParser: true });
        return mongoose.connection;
    }

    async clearDb() {
        await this._db.dropDatabase();
    }
}