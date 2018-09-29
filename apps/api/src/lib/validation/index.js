import validator from 'node-validator';
import { ValidationError } from '../errorHandler';

/**
 * Validation class
 */
export class Validation {

    /**
     * node-validator module
     * @returns {Function} validator module
     */
    get validator() {
        return validator;
    }

    /**
     * Validates a model or a value
     * @param {Object} rules validation rules
     * @param {Object} value value to validate
     * @param {Function(err:Error)} next error callback
     * @returns {Boolean} Returns false if validation failed, true otherwise
     */
    validate(rules, value, next) {
        let valid;

        validator.run(rules, value, (errorCount, err) => {
            valid = errorCount === 0;
            if (!valid) {
                const resultErr = new ValidationError('Validation failed', err);

                if (next) {
                    return next(resultErr);
                }
                throw resultErr;
            }
        });
        return valid;
    }
}

export default new Validation();
