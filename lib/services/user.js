import logger from '../logger';
import { ValidationError } from '../errorHandler';
import jwt from 'jsonwebtoken';
import validator from '../validator';
import Player from '../models/User';
import config from '../../etc/config';
import UserModel from '../models/User';

export default class UserService {
    constructor() {
        this._logger = logger.getLogger('UserService');
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

    get register() {
        return this._register.bind(this);
    }

    get resetPassword() {
        return this._resetPassword.bind(this);
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

    async _register(req, res, next) {
        try {
            this._validateUser(req, next);
            const userObject = req.body;

            const user = await new UserModel.User(userObject).save();

            res.status(200).json({ id: user.id });
        } catch (err) {
            next(err);
        }
    }

    _resetPassword(req, res, next) {
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

    _validateUser(req, next) {
        const validationRules = validator.isObject()
            .withRequired('email', validator.isString({ regex: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/ }))
            .withRequired('name', validator.isString());

        validator.validate(validationRules, req.body, next);
    }
}
