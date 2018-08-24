import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import layouts from 'handlebars-layouts';
import { promisify, promisifyAll } from 'bluebird';
import path from 'path';
import fs from 'fs';
import logger from './logger';
import config from '../../config/config';
import { NotFoundError } from './errorHandler';

handlebars.registerHelper(layouts(handlebars));
handlebars.registerPartial('layout', fs.readFileSync(path.join(__dirname, '/../emails', 'layout.hbs'), 'utf8'));

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
            const bodyTemplate = await readFile(path.join(__dirname, '/../emails', templateName, 'html.hbs'));
            const subjectTemplate = await readFile(path.join(__dirname, '/../emails', templateName, 'subject.hbs'));

            return {
                body: handlebars.compile(bodyTemplate.toString())({ ...sendData }),
                subject: handlebars.compile(subjectTemplate.toString())({ ...sendData })
            };
        } catch (err) {
            throw new NotFoundError('Template not found.');
        }
    }
}

export default new EmailSender();
