'use strict';
import log4js from 'log4js';
import path from 'path';
import config from '../etc/config'

export default log4js.configure({
    appenders: {
        console: {
            type: 'stdout'
        },
        file: {
            type: 'file',
            filename: path.join(process.cwd(), config.logger.path, config.logger.filename)
        }
    },
    categories: {
        default: {
            appenders: [
                'console',
                'file'
            ],
            level: 'debug'
        }
    }
});