'use strict';
import nodemailer from 'nodemailer';
import { promisify }  from 'bluebird';
import logger from './logger';
import config from '../etc/config';

class EmailSender {
    constructor() {
        this._logger = logger.getLogger('MailSender');
        this._tranporter = promisify(nodemailer.createTransport(config.mail.transport_options));
    }

    async sendMail(destinationEmail, type, actionId) {
        try {
            const sendData = {
                ...data,
                participantUiUrl : config.participantUiUrl,
                year             : (new Date()).getFullYear()
            };
            const template = await this.getTemplate(type, sendData);
            const response = await this._transport.sendMailAsync(mailOptions);


            this._logger.info(`Email was successfully sent to ${destinationEmail}`);
            return response.message;
        } catch (err) {
            this._logger.error(`Email send was rejected by error: ${err}`);
            throw err;
        }
    }

    async _getTemplate(templateName, sendData) {
        const templatesDir = pathModule.join(__dirname, '/../../templates');
        const template = await Template.findById(templateName);

        const bodyTemplate = await fse.readFile(pathModule.join(templatesDir, templateName, 'body.html'));

        let text = markdown.toHTML(template.text);

        text = text.replace(/\n\n/g, '').replace(/\n/g, '<br>');

        text = Handlebars.compile(text)(sendData);

        text = new Handlebars.SafeString(text);

        return {
            body    : Handlebars.compile(bodyTemplate.toString())({ ...sendData, text }),
            subject : Handlebars.compile(template.subject)(sendData)
        };
    }
}

export default new EmailSender();