import nodemailer from 'nodemailer';
import { promisify } from 'bluebird';
import logger from './logger';
import config from '../etc/config';

class EmailSender {
    constructor() {
        this._logger = logger.getLogger('MailSender');
        this._tranporter = promisify(nodemailer.createTransport(config.mail.transport_options));
    }

    async send(destinationEmail, type, sendData) {
        try {
            const template = await this._getTemplate(type, sendData);
            const mailOptions = {
                from: config.mail.from,
                to: destinationEmail,
                subject: template.subject,
                html: template.body
            };

            const response = await this._transport.sendMailAsync(mailOptions);

            this._logger.info(`Email was successfully sent to ${destinationEmail}`);
            return response.message;
        } catch (err) {
            this._logger.error(`Email send was rejected by error: ${err}`);
            throw err;
        }
    }

    async _getTemplate(templateName, sendData) {
        const templatesDir = pathModule.join(__dirname, '../templates');

        const bodyTemplate = await fse.readFile(pathModule.join(templatesDir, templateName, 'body.html'));

        text = Handlebars.compile(text)(sendData);

        text = new Handlebars.SafeString(text);

        return {
            body: Handlebars.compile(bodyTemplate.toString())({ ...sendData, text }),
            subject: Handlebars.compile(template.subject)(sendData)
        };
    }
}

export default new EmailSender();
