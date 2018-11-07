import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import Express from 'express';
import io from 'socket.io';
import log4js from 'log4js';
import path from 'path';
import fs from 'fs';
import config from '../../config/config';
import routes from '../routes';
import passport from './passport';
import { NotFoundError, errorHandler } from './errorHandler';
import { Game } from '../models';
import redisClient from './redisClient';

import socketioJwt from 'socketio-jwt';

/**
 * Main class
 */
export default class Service {
    constructor(configForTests) {
        this._config = configForTests || config;
        this._logger = log4js.getLogger('Main Service');
        this._db = null;
        this._app = null;
        this._socket = null;
        this._configureLogs();
    }

    /**
     * Starts the app
     */
    async start() {
        const express = new Express();

        express.use(Express.json());
        express.use(Express.urlencoded({ extended: false }));
        express.use(cookieParser());
        express.use(this._config.baseUrl, routes.game);
        express.use(this._config.baseUrl, routes.user);
        express.use(passport.initialize());
        express.use((req, res, next) => {
            next(new NotFoundError(`Could not find path ${ req.originalUrl }. Not found`, 404));
        });
        express.use(errorHandler);

        this._db = await this._connectDatabase();
        this._db.on('error', (err) => this._logger.error(`Mongoose connection error: ${err}`));
        this._db.once('open', () => this._logger.info('Succesfully connected to db'));

        await this._stopAllGames();

        this._app = express.listen(this._config.port, () => {
            this._logger.info(`App listening on port ${this._config.port}`);
        });

        this._socket = io.listen(this._app);
        this._socket
            .on('connection', socketioJwt.authorize({
                secret: config.secretKey,
                timeout: 15000
            }))
            .on('authenticated', (socket) => {
                for (const key in routes.socketEvents) {
                    socket.on(key, routes.socketEvents[ key ].bind(null, socket, this._socket));
                }
            })
            .on('error', (error) => {
                this._logger.error('Websocket error: ', error);
            });


        process.on('uncaughtException', (err) => {
            this._logger.error('Unhandled exception', err);
        });
        process.on('unhandledRejection', (err) => {
            this._logger.error('Unhandled rejection', err);
        });
        process.on('SIGTERM', async () => {
            this._logger.info('Received SIGTERM, going to shutdown server.');
            await this.stop();
            this._logger.info('Exited... Buy :)');
        });
    }

    /**
     * Stops app
     * @returns {Promise} promise
     */
    async stop() {
        await this._app.close();
        await this._db.close();
        await redisClient.close();
        this._socket.close();
        this._logger.info('Server stopped');
    }

    /**
     * Returns express server
     * @returns {Server} returns express server
     */
    get server() {
        return this._app;
    }

    async _connectDatabase() {
        await mongoose.connect(
            this._config.db.url,
            {
                useNewUrlParser: true,
                useCreateIndex: true,
                useFindAndModify: false
            }
        );
        return mongoose.connection;
    }

    /**
     * Clears database
     * @returns {Promise} returns promise which will be resolved when db cleared
     */
    async clearDb() {
        await this._db.dropDatabase();
        this._logger.info('Cleared DB');
    }

    _configureLogs() {
        const pathToFile = path.join(__dirname, '../../', this._config.logger.path);
    
        if (!fs.existsSync(pathToFile)) {
            fs.mkdirSync(pathToFile);
        }
        const appenders = {
            file: {
                type: 'file',
                filename: path.join(pathToFile, this._config.logger.filename),
                timezoneOffset: 0
            }
        };
        const categories = {
            default: { appenders: [ 'file' ], level: 'error' }
        };

        if (process.env.NODE_ENV !== 'production') {
            appenders.console = { type: 'console' };
            categories.default.appenders.push('console');
            categories.default.level = 'info';
        }
    
        log4js.configure({ categories, appenders });
    }

    _stopAllGames() {
        this._logger.info('Failing all running games');

        return Game.updateMany(
            {
                status: { $in: [ 'PENDING', 'IN_PROGRESS' ] }
            }, {
                status: 'FAILED'
            }
        );
    }
}
