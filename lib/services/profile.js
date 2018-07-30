'use strict';
import logger from '../logger';
import jwt from 'jsonwebtoken';
import validator from 'node-validator';

export default class ProfileService {
    constructor(){
      this._logger = logger.getLogger('ProfileService');
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

    get getProfileInfo() {
      return this._getProfileInfo.bind(this);
    }

    get updateProfileInfo() {
      return this._updateProfileInfo.bind(this);
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

    _register(req, res, next) {
      try {

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

    _getProfileInfo(req, res, next) {
      try {

      } catch (err) {
        next(err);
      }
    }

    _updateProfileInfo(req, res, next) {
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
      const validatorRules = validator.isObject()
        .withRequired('email', validator.isString({ regex: /^(\S+)@([a-z0-9-]+)(\.)([a-z]{2,4})(\.?)([a-z]{0,4})+$/})
        .withRequired('name', validator.isString()));
      
      const validationResult = validator.run(validatorRules, validatorRules, next);

    }
}