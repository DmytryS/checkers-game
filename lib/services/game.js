import config from '../../etc/config';
import logger from '../logger';

export default class GameService {
    constructor() {
        this._logger = logger(config).getLogger('GameService');
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