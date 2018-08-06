import log4js from 'log4js';
import path from 'path';

export default (config) => {
    return log4js.configure({
        appenders: {
            console: {
                type: 'console'
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
                level: 'info'
            }
        }
    });
};
