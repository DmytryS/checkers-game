import log4js from 'log4js';

/**
 * Game service
 */
export default class GameService {

    /**
     * Constructs game service
     * @returns {GameService} game service
     */
    constructor() {
        this._logger = log4js.getLogger('GameService');
    }

    /**
     * Returns endpoint which creates new game
     * @returns {Function(req, res, next)} endpoint which creates new game
     */
    get createGame() {
        return this._createGame.bind(this);
    }

    /**
     * Returns endpoint which returns list of games
     * @returns {Function(req, res, next)} endpoint which returns list of nodes
     */
    get findGame() {
        return this._findGame.bind(this);
    }

    /**
     * Returns endpoint which returns list of played games
     * @returns {Function(req, res, next)} endpoint returns list of played games
     */
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
