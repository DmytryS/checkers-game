import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import Express from 'express';
import config from '../etc/config';
import routes from './routes';
import logger from './logger';

export default class Service {
    constructor(configForTests) {
        this._config = configForTests || config;
        this._logger = logger(this._config).getLogger('Main Service');
        this._db = null;
        this._app = null;
    }

    start() {
        const express = new Express();

        express.use(Express.json());
        express.use(Express.urlencoded({ extended: false }));
        express.use(cookieParser());
        express.use(this._config.baseUrl, routes.api);
        express.use(this._onError.bind(this));

        this._db = this._connectDatabase();
        this._db.on('error', (err) => this._logger.error(`Mongoose connection error: ${err}`));
        this._db.once('open', () => this._logger.info('Succesfully connected to db'));

        this._app = express.listen(this._config.port, () => {
            this._logger.info(`App listening on port ${this._config.port}`);
        });

        process.on('uncaughtException', (err) => {
            this._logger.error('Unhandled exception', err);
        });
        process.on('unhandledRejection', (err) => {
            this._logger.error('Unhandled rejection', err);
        });
    }

    async stop() {
        await this._app.close();
        await this._db.close();
        this._logger.info('Server stopped');
    }

    get server() {
        return this._app;
    }

    _onError(err, req, res, next) {
        switch (err.code) {
            case 'EACCES':
                this._logger.error(`${this._config.port} requires elevated privileges`);
                process.exit(1);
                break;
            case 'EADDRINUSE':
                this._logger.error(`${this._config.port} is already in use`);
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
        this._logger.info('Cleared DB');
    }
}
