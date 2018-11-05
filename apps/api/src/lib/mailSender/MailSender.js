import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import layouts from 'handlebars-layouts';
import { promisifyAll, promisify } from 'bluebird';
import path from 'path';
import fs from 'fs';
import log4js from 'log4js';
import { InternalError } from '../errorHandler';
import config from '../../../config/config';

const readFile = promisify(fs.readFile);

handlebars.registerHelper(layouts(handlebars));
handlebars.registerPartial('layout', fs.readFileSync(path.join(__dirname, '../../emails', 'layout.hbs'), 'utf8'));

/**
 * Email sender class
 */
export class EmailSender {

    /**
     * Constructs email sender
     * @param {Object} config config
     */
    constructor(configuration) {
        this._config = configuration;
        this._logger = log4js.getLogger('MailSender');

        if (process.env.NODE_ENV === 'test') {
            this._tranport = {
                sendMailAsync: Promise.resolve()
            };
        } else {
            this._tranport = promisifyAll(
                nodemailer.createTransport(this._config.mail.transport_options)
            );
        }
        
    }

    /**
     * Sends email to user
     * @param {String} email destination email
     * @param {String} templateName template name
     * @param {Object} data data to send
     * @returns {Promise} Returns promise which will be resolved mail sent
     */
    async send(email, templateName, data) {
        try {
            const template = await this._getTemplate(templateName, data);
            const mailOptions = {
                from: this._config.mail.from,
                to: email,
                subject: template.subject,
                html: template.body
            };

            const response = await this._tranport.sendMailAsync(mailOptions);

            this._logger.info(`Email was successfully sent to ${email}`);
            return response.message;
        } catch (err) {
            this._logger.error(`Email send was rejected by error: ${err}`);
            throw err;
        }
    }

    async _getTemplate(templateName, data) {
        try {
            const bodyTemplate = await readFile(path.join(__dirname, '../../emails', templateName, 'html.hbs'));
            const subjectTemplate = await readFile(path.join(__dirname, '../../emails', templateName, 'subject.hbs'));

            return {
                body: handlebars.compile(bodyTemplate.toString())({ ...data }),
                subject: handlebars.compile(subjectTemplate.toString())({ ...data })
            };
        } catch (err) {
            this._logger.error('An error occured during mail send', err);
            throw new InternalError('An error occured during mail send');
        }
    }
}

export default new EmailSender(config);
