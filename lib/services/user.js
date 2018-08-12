import logger from '../logger';
import passport from '../passport';
import validator from '../validator';
import config from '../../etc/config';
import User from '../models/User';
import Action from '../models/Action';
import { ValidationError, NotFoundError } from '../errorHandler';
import mailSender from '../mailSender';
import { dumpUser } from './utils';

export default class UserService {
    constructor() {
        this._logger = logger(config).getLogger('UserService');
    }

    get sessionCreate() {
        return this._sessionCreate.bind(this);
    }

    get sessionRenew() {
        return this._sessionRenew.bind(this);
    }

    get sessionCheck() {
        return this._sessionCheck.bind(this);
    }

    get registerUser() {
        return this._registerUser.bind(this);
    }

    get runAction() {
        return this._runAction.bind(this);
    }

    get resetUserPassword() {
        return this._resetUserPassword.bind(this);
    }

    get getUserInfo() {
        return this._getUserInfo.bind(this);
    }

    get updateUserInfo() {
        return this._updateUserInfo.bind(this);
    }

    get getGamesHistory() {
        return this._getGamesHistory.bind(this);
    }

    async _sessionCreate(req, res, next) {
        try {
            this._validateUserCredentials(req, next);

            passport.authenticateCredentials(req, res, next);
        } catch (err) {
            next(err);
        }
    }

    async _sessionRenew(req, res, next) {
        try {
            // const jwt = req.get('Authorization');

            await passport.authenticateJwt(this, req, res, next);
        } catch (err) {
            next(err);
        }
    }

    async _sessionCheck(req, res, next) {
        try {
            await passport.authenticateJwt.call(this, req, res, next);
        } catch (err) {
            next(err);
        }
    }

    async _registerUser(req, res, next) {
        try {
            this._validateUser(req, next);
            const userObject = req.body;

            if (await User.findOne({ email: userObject.email })) {
                throw new ValidationError(`User with email of \'${userObject.email}\' already exists`);
            }
            if (await User.findOne({ name: userObject.name })) {
                throw new ValidationError(`User with name of \'${userObject.name}\' already exists`);
            }

            const user = await new User(userObject).save();
            const action = await new Action({
                userId: user.id,
                type: 'REGISTER'
            }).save();

            await mailSender.send({ email: user.email, templateName: 'REGISTER', sendData: { actionId: action.id, name: user.name } });

            res.status(200).json({ id: user.id });
        } catch (err) {
            next(err);
        }
    }

    async _runAction(req, res, next) {
        try {
            const actionId = req.params.actionId;
            
            const action = await this._checkifActionExists(actionId);

            this._validateUserPassword(req, next);

            const user = await User.findById(action.userId);
            
            await user.setPassword(req.body.password);

            await action.remove();

            res.sendStatus(200);
        } catch (err) {
            next(err);
        }
    }

    async _resetUserPassword(req, res, next) {
        try {
            this._validateEmail(req, next);

            const user = await User.findOne({ email: req.body.email });

            if (!user) {
                throw new NotFoundError(`User with email of ${req.body.email} not found`);
            }

            const action = await new Action({
                userId: user.id,
                type: 'RESET_PASSWORD'
            });

            await mailSender.send({ email: user.email, templateName: 'RESET_PASSWORD', sendData: { actionId: action.id, name: user.name } });

            res.sendStatus(200);
        } catch (err) {
            next(err);
        }
    }

    async _getUserInfo(req, res, next) {
        try {
            const userId = this.context.id;
            const user = await this._checkifUserExists(userId);

            res.json(dumpUser(user));
        } catch (err) {
            next(err);
        }
    }

    async _updateUserInfo(req, res, next) {
        try {
            const userObject = this._validateUser(req, next);
            const user = await User.findById(this.context.usserId);

            if (user.email !== userObject.email && await User.findOne({ email: userObject.email })) {
                throw new ValidationError(`User with email of \'${userObject.email}\' already exists`);
            }

            if (user.name !== userObject.name && await User.findOne({ name: userObject.name })) {
                throw new ValidationError(`User with name of \'${userObject.name}\' already exists`);
            }
            const updatedUser = await user.update(userObject);

            res.json(dumpUser(updatedUser));
        } catch (err) {
            next(err);
        }
    }

    _getGamesHistory(req, res, next) {
        try {

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

    _validateUser(req, next) {
        const validationRules = validator.isObject()
            .withRequired('email', validator.isString({ regex: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/ }))
            .withRequired('name', validator.isString());

        validator.validate(validationRules, req.body, next);
    }

    _validateEmail(req, next) {
        const validationRules = validator.isObject()
            .withRequired('email', validator.isString({ regex: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/ }));

        validator.validate(validationRules, req.body, next);
    }

    _validateUserPassword(req, next) {
        const validatepasswordLength = (value, onError) => {
            if (value.password.length < config.minPasswordLength) {
                return onError(`Password cannot be less then ${ config.minPasswordLength } symbols`, 'password', null);
            }
        
            if (!/(.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(value.password)) {
                return onError('Password must have lowercase letters, uppercase letters and numbers', 'password', null);
            }
        };

        const validationRules = validator.isObject()
            .withCustom(validatepasswordLength.bind(this))
            .withRequired('password', validator.isString());

        validator.validate(validationRules, req.body, next);
    }

    _validateUserCredentials(req, next) {
        const validationRules = validator.isObject()
            .withRequired('email', validator.isString({ regex: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/ }))
            .withRequired('password', validator.isString());

        validator.validate(validationRules, req.body, next);
    }
}
