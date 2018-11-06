import log4js from 'log4js';
import validation from '../lib/validation';
import { User, Game } from '../models';
import { dumpGame } from '../lib/utils';
import redisClient from '../lib/redisClient';
import { NotFoundError } from '../lib/errorHandler';

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
        this._redisClient = redisClient;
    }

    /**
     * Returns endpoint which creates new game
     * @returns {Function(req, res, next)} endpoint which creates new game
     */
    get joinOrCreateGame() {
        return this._joinOrCreateGame.bind(this);
    }

    /**
     * Returns endpoint which returns list of played games
     * @returns {Function(req, res, next)} endpoint returns list of played games
     */
    get getGamesHistory() {
        return this._getGamesHistory.bind(this);
    }

    async _joinOrCreateGame(req, res, next) {
        try {
            const userId = req.user.id;
            let game = false;

            await this._checkifUserExists(userId);
            
            const games = await Game.findGamesWithUser(
                userId,
                {
                    status: { $in: [ 'PENDING', 'IN_PROGRESS' ] }
                }
            );

            if(!games || games && games.length === 0) {
                const awaitingGames = await Game.findPendingGamesForUser(userId);

                if(awaitingGames.length > 0) {
                    game = await awaitingGames[ 0 ].join(userId) ;

                    if(!await this._redisClient.exists(game.id)) {
                        throw new NotFoundError(`Game with id of ${game.id} do not exists in redis.`);
                    }

                    await this._redisClient.set(
                        game.id,
                        {
                            player1: game.player1,
                            player2: game.player2,
                            status: 'IN_PROGRESS',
                            board: []
                        }
                    );
                } else {
                    game = await Game.createNew(userId);

                    await this._redisClient.set(
                        game.id,
                        {
                            player1: game.player1,
                            player2: null,
                            status: 'PENDING',
                            board: []
                        }
                    );
                }
            } else {
                if (games.length > 1) {
                    this._logger.error(`Too much games for user with id of ${userId}`);

                    for (const gameToDelete of games) {
                        await this._redisClient.delete(gameToDelete.id);
                    }

                    await Game.updateMany(
                        {
                            $or: [ {
                                player1: userId
                            }, {
                                player2: userId
                            } ],
                            status: { $in: [ 'PENDING', 'IN_PROGRESS' ] }
                        }, {
                            status: 'FAILED'
                        }
                    );

                    game = await Game.createNew(userId);

                    await this._redisClient.set(
                        game.id,
                        {
                            player1: game.player1,
                            player2: null,
                            status: 'PENDING',
                            board: []
                        }
                    );
                }

                if (games.length === 1) {
                    game = games[ 0 ];
                }
            }

            res.json(dumpGame(game));
        } catch (err) {
            next(err);
        }
    }

    async _getGamesHistory(req, res, next) {
        try {
            const userId = req.user.id;

            await this._checkifUserExists(userId);

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
