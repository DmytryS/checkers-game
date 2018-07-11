'use strict';
import lo4js from 'log4js';

export default class GameService {
    constructor(){
      this._logger = lo4js.getLogger('GameService');
      this._logger.level = 'debug';
    }

    get getGamesHistory() {
      return this._getGamesHistory.bind(this);
    }

    _getGamesHistory(req, res, next) {
      try {

      } catch (err) {
        next(err);
      }
    }
}