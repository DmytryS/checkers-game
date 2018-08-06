import logger from '../logger';
import jwt from 'jsonwebtoken';
import validator from '../validator';
import config from '../../etc/config';
import User from '../models/User';
import Action from '../models/Action';
import { ValidationError } from '../errorHandler';
import mailSender from '../mailSender';

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

    get activateUser() {
        return this._activateUser.bind(this);
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

    _sessionCreate(req, res, next) {
        try {

        } catch (err) {
            next(err);
        }
    }

    _sessionRenew(req, res, next) {
        try {

        } catch (err) {
            next(err);
        }
    }

    _sessionCheck(req, res, next) {
        try {

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
            });

            await mailSender.send({ email: user.email, templateName: 'REGISTER', sendData: { actionId: action.id } });

            res.status(200).json({ id: user.id });
        } catch (err) {
            next(err);
        }
    }

    async _activateUser(req, res, next) {
        try {
            const actionId = req.params.actionId;
            const action = await this._checkifActionExists(actionId);

            this._validateUserPassword(req, next);

            const user = await User.findById(action.userId);

            res.sendStatus(200);
        } catch (err) {
            next(err);
        }
    }

    _resetUserPassword(req, res, next) {
        try {

        } catch (err) {
            next(err);
        }
    }

    _getUserInfo(req, res, next) {
        try {

        } catch (err) {
            next(err);
        }
    }

    _updateUserInfo(req, res, next) {
        try {

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

    _validateUserPassword(req, next) {
        const validatepasswordLength = (value, onError) => {
            if (value.password.length < config.minPasswordLength) {
                return onError((options || {}).message || `Password cannot be less then ${ config.minPasswordLength } symbols`);
            }
        
            if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(value)) {
                return onError((options || {}).message || 'Password must have lowercase letters, uppercase letters and numbers');
            }
        };

        const validationRules = validator.isObject()
            .withCustom(validatepasswordLength.bind(this))
            .withRequired('password', validator.isString());

        validator.validate(validationRules, req.body, next);
    }
}