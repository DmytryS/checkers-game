import moment from 'moment';
import jwt from 'jsonwebtoken';
import log4js from 'log4js';
import passport from '../lib/passport';
import validation from '../lib/validation';
import config from '../../config/config';
import { User, Action } from '../models';
import { ValidationError, NotFoundError } from '../lib/errorHandler';
import mailSender from '../lib/mailSender';
import { dumpUser, dumpAction } from '../lib/utils';

/**
 * Uesr service
 */
export default class UserService {

    /**
     * Constructs user service
     * @returns {UserService} user service
     */
    constructor() {
        this._logger = log4js.getLogger('UserService');
    }

    /**
     * Returns endpoint which returns jwt token
     * @returns {Function(req, res, next)} endpoint which returns jwt token
     */
    get sessionCreate() {
        return this._sessionCreate.bind(this);
    }

    /**
     * Returns endpoint which returns prolonged jwt token
     * @returns {Function(req, res, next)} endpoint which returns prolonged jwt token
     */
    get sessionRenew() {
        return this._sessionRenew.bind(this);
    }

    /**
     * Returns endpoint which creates new user
     * @returns {Function(req, res, next)} endpoint which creates new user
     */
    get registerUser() {
        return this._registerUser.bind(this);
    }

    /**
     * Returns endpoint which return action
     * @returns {Function(req, res, next)} endpoint which returns action
     */
    get getAction() {
        return this._getAction.bind(this);
    }

    /**
     * Returns endpoint which confirms user activation or password reset
     * @returns {Function(req, res, next)} endpoint which confirms user activation or password reset
     */
    get runAction() {
        return this._runAction.bind(this);
    }

    /**
     * Returns endpoint which resets user password
     * @returns {Function(req, res, next)} endpoint which resets user password
     */
    get resetUserPassword() {
        return this._resetUserPassword.bind(this);
    }

    /**
     * Returns endpoint which returns user
     * @returns {Function(req, res, next)} endpoint which returns user
     */
    get getUserInfo() {
        return this._getUserInfo.bind(this);
    }

    /**
     * Returns endpoint which updates user
     * @returns {Function(req, res, next)} endpoint which updates user
     */
    get updateUserInfo() {
        return this._updateUserInfo.bind(this);
    }

    async _sessionCreate(req, res, next) {
        try {
            this._validateUserCredentials(req);
            
            const user = await passport.authenticateCredentials(req);

            const expiresIn = moment().add(1, 'day');
            const token = jwt.sign(
                dumpUser(user),
                config.secretKey,
                {
                    expiresIn: '60m'
                }
            );
            
            res.json({ token, expiresIn });
        } catch (err) {
            next(err);
        }
    }

    async _sessionRenew(req, res, next) {
        try {
            const expiresIn = moment().add(1, 'day');
            const token = jwt.sign(
                req.user,
                config.secretKey,
                {
                    expiresIn: '1d'
                }
            );
            
            res.json({ token, expiresIn });
        } catch (err) {
            next(err);
        }
    }

    async _registerUser(req, res, next) {
        try {
            this._validateUser(req);
            const userObject = req.body;
            let action;
            let user = await User.findOne({
                email: userObject.email,
                name: userObject.name
            });

            const existingUserWithName = await User.findOne({
                email: { $ne: userObject.email },
                name: userObject.name
            });
            const existingUserWithEmail = await User.findOne({
                email: userObject.email,
                name: { $ne: userObject.name }
            });

            if (existingUserWithName) {
                throw new ValidationError(`User with name of \'${userObject.name}\' already exists`);
            }
            if (existingUserWithEmail) {
                throw new ValidationError(`User with email of \'${userObject.email}\' already exists`);
            }

            if (user) {
                if (user.status === 'ACTIVE') {
                    throw new ValidationError(`User with name of \'${userObject.name}\' already exists`);
                }
                if (user.status === 'PENDING') {
                    action = await Action.findOne({
                        userId: user.id,
                        type: 'REGISTER'
                    });

                    if (!action) {
                        action = await new Action({
                            userId: user.id,
                            type: 'REGISTER'
                        }).save();
                    }
                }
            } else {
                user = await new User(userObject).save();

                action = await new Action({
                    userId: user.id,
                    type: 'REGISTER'
                }).save();
            }
            

            await mailSender.send(
                user.email,
                'REGISTER',
                {
                    actionId: action.id,
                    name: user.name,
                    uiUrl: process.env.NODE_ENV === 'test' ? 'http://localhost' : config.uiUrl
                }
            );

            res.sendStatus(200);
        } catch (err) {
            next(err);
        }
    }

    async _getAction(req, res, next) {
        try {
            const actionId = req.params.actionId;
            const action = await this._checkifActionExists(actionId);

            res.json(dumpAction(action));
        } catch (err) {
            next(err);
        }
    }

    async _runAction(req, res, next) {
        try {
            const actionId = req.params.actionId;
            const action = await this._checkifActionExists(actionId);

            this._validateUserPassword(req);
            const user = await User.findById(action.userId);
            
            await user.setPassword(req.body.password);
            
            await action.remove();

            res.sendStatus(200);
        } catch (err) {
            next(err);
        }
    }

    async _resetUserPassword(req, res, next) {
        let user;

        try {
            this._validateEmail(req);

            user = await User.findOne({ email: req.body.email });

            if (!user) {
                throw new NotFoundError(`User with email of ${req.body.email} not found`);
            }

            const action = await new Action({
                userId: user.id,
                type: 'RESET_PASSWORD'
            });

            await mailSender.send(
                user.email,
                'RESET_PASSWORD',
                {
                    actionId: action.id,
                    name: user.name,
                    uiUrl: process.env.NODE_ENV === 'test' ? 'http://localhost' : config.uiUrl
                }
            );
            

            res.sendStatus(200);
        } catch (err) {
            if (user) {
                await user.remove();
            }
            next(err);
        }
    }

    async _getUserInfo(req, res, next) {
        try {
            const userId = req.user.id;
            const user = await this._checkifUserExists(userId);

            res.json(dumpUser(user));
        } catch (err) {
            next(err);
        }
    }

    async _updateUserInfo(req, res, next) {
        try {
            this._validateUser(req);

            const userObject = req.body;
            const user = await User.findById(req.user.id);

            if (user.email !== userObject.email) {
                throw new ValidationError('Can not change email');
            }

            if (user.name !== userObject.name && await User.findOne({ name: userObject.name })) {
                throw new ValidationError(`User with name of \'${userObject.name}\' already exists`);
            }
            const updatedUser = await user.updateMethod({ name: userObject.name });

            res.json(dumpUser(updatedUser));
        } catch (err) {
            next(err);
        }
    }

    async _checkifUserExists(userId) {
        const user = await User.findById(userId);
        
        if (!user) {
            throw new NotFoundError(`User with specified id of ${userId} not found`);
        }
        return user;
    }

    async _checkifActionExists(actionId) {
        const action = await Action.findById(actionId);
        
        if (!action) {
            throw new NotFoundError(`Action with specified id of ${actionId} not found`);
        }
        return action;
    }

    _validateUser(req) {
        const validator = validation.validator;
        const validationRules = validator.isObject()
            .withRequired('email', validator.isString({ regex: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/ }))
            .withRequired('name', validator.isString());

        validation.validate(validationRules, req.body);
    }

    _validateEmail(req) {
        const validator = validation.validator;
        const validationRules = validator.isObject()
            .withRequired('email', validator.isString({ regex: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/ }));

        validation.validate(validationRules, req.body);
    }

    _validateUserPassword(req) {
        const validatepasswordLength = (value, onError) => {
            if (value.password) {
                if (value.password.length < config.minPasswordLength) {
                    return onError(`Password cannot be less then ${ config.minPasswordLength } symbols`, 'password', null);
                }
        
                if (!/^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/.test(value.password)) {
                    return onError('Password must have lowercase letters, uppercase letters and numbers', 'password', null);
                }
            }
        };

        const validator = validation.validator;
        const validationRules = validator.isObject()
            .withCustom(validatepasswordLength.bind(this))
            .withRequired('password', validator.isString());

        validation.validate(validationRules, req.body);
    }

    _validateUserCredentials(req) {
        const validator = validation.validator;
        const validationRules = validator.isObject()
            .withRequired('email', validator.isString({ regex: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/ }))
            .withRequired('password', validator.isString());

        validation.validate(validationRules, req.body);
    }
}
