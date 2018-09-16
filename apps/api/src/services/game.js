import config from '../../config/config';
import logger from '../lib/logger';


export default class GameService {
    constructor() {
        this._logger = logger(config).getLogger('GameService');
    }

    get createGame() {
        return this._createGame.bind(this);
    }

    get findGame() {
        return this._findGame.bind(this);
    }

    get getGamesHistory() {
        return this._getGamesHistory.bind(this);
    }

    async _createGame(req, res, next) {
        try {

        } catch (err) {
            next(err);
        }
    }

    async _findGame(req, res, next) {
        try {

        } catch (err) {
            next(err);
        }
    }

    async _getGamesHistory(req, res, next) {
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
}
