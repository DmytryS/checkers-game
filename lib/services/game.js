'use strict';
import logger from '../logger';

export default class GameService {
    constructor(){
      this._logger = logger.getLogger('GameService');
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