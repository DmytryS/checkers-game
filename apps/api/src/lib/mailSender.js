import nodemailer from 'nodemailer';
import Handlebars from 'handlebars';
import { promisify, promisifyAll } from 'bluebird';
import path from 'path';
import fs from 'fs';
import logger from './logger';
import config from '../../config/config';
import { NotFoundError } from './errorHandler';

const readFile = promisify(fs.readFile);

class EmailSender {
    constructor() {
        this._logger = logger(config).getLogger('MailSender');
        this._tranport = promisifyAll(nodemailer.createTransport(config.mail.transport_options));
    }

    async send({ email, templateName, sendData }) {
        try {
            const template = await this._getTemplate(templateName, sendData);
            const mailOptions = {
                from: config.mail.from,
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

    async _getTemplate(templateName, sendData) {
        try {
            const bodyTemplate = await readFile(path.join(__dirname, '../emails', templateName, 'body.html'));
            const subject = {
                REGISTER: 'CheckersApp Registration email',
                RESET_PASSWORD: 'Reset password for CheckersApp'
            };

            return {
                body: Handlebars.compile(bodyTemplate.toString())({ ...sendData }),
                subject
            };
        } catch (err) {
            throw new NotFoundError('Template not found.');
        }
    }
}

export default new EmailSender();
