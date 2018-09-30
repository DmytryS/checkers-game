import log4js from 'log4js';
import { Game } from '../models';
import { dumpGame } from '../lib/utils';

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
     * Returns endpoint which returns list of awaiting games
     * @returns {Function(req, res, next)} endpoint which returns list of awaiting games
     */
    get getAwaitingGames() {
        return this._getAwaitingGames.bind(this);
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

    async _getAwaitingGames(req, res, next) {
        try {

        } catch (err) {
            next(err);
        }
    }

    async _getGamesHistory(req, res, next) {
        try {
            const userId = this.context.id;

            this._validateFilterParams(req, next);
            const games = await Game.findGamesWithUser(userId, req.query);

            res.json(games.map(dumpGame));
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

    _validateFilterParams(req, next) {
        const validator = validation.validator;
        const validationRules = validator.isObject()
            .withOptional('offset', validator.isInteger({ allowString: true, min: 0 }))
            .withOptional('limit', validator.isInteger({ allowString: true, min: 1 }));

        validation.validate(validationRules, req.query, next);
    }
}
