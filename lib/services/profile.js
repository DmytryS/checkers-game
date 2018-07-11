'use strict';
import lo4js from 'log4js';

export default class ProfileService {
    constructor(){
      this._logger = lo4js.getLogger('ProfileService');
      this._logger.level = 'debug';
    }

    get sessionCreate() {
      return this._sessionCreate.bind(this);
    }

    get sessionRenew() {
      return this._sessionRenew.bind(this);
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
}