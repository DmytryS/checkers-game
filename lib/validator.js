import validator from 'node-validator';
import { ValidationError } from './errorHandler';

validator.validate = (rules, toValidate, next) => {
    let valid;
        
    validator.run(rules, toValidate, (errorCount, err) => {
        valid = errorCount === 0;
        if (!valid) {
            const resultErr = new ValidationError('Validation failed', err);

            if (next) {
                throw resultErr;
                // return next(resultErr);
            }
            throw resultErr;
        }
    });

    return valid;
};

export default validator;
