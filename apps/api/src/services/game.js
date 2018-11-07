import log4js from 'log4js';
import Checkers from '../lib/checkers';
import validation from '../lib/validation';
import { User, Game } from '../models';
import { dumpGame } from '../lib/utils';
import redisClient from '../lib/redisClient';
import { NotFoundError, ValidationError } from '../lib/errorHandler';

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

    /**
     * Returns endpoint which starts game
     * @returns {Function(socket, data)} endpoint starts game
     */
    get startGame() {
        return this._startGame.bind(this);
    }

    /**
     * Returns endpoint which ends game
     * @returns {Function(socket, data)} endpoint ends game
     */
    get endGame() {
        return this._endGame.bind(this);
    }

    /**
     * Returns endpoint which returns game board after user move
     * @returns {Function(socket, data)} endpoint returns game board after user move
     */
    get makeMove() {
        return this._makeMove.bind(this);
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

                    const redisGame = await this._redisClient.getByKey(game.id);

                    await this._redisClient.set(
                        game.id,
                        {
                            player1: {
                                id: redisGame.player1.id,
                                status: redisGame.player1.status,
                                socketId: redisGame.player1.socketId
                            },
                            player2: {
                                id: game.player2,
                                status: 'OFFLINE',
                                socketId: null
                            },
                            status: 'PENDING',
                            board: []
                        }
                    );
                } else {
                    game = await Game.createNew(userId);

                    await this._redisClient.set(
                        game.id,
                        {
                            player1: {
                                id: game.player1,
                                status: 'OFFLINE',
                                socketId: null
                            },
                            player2: {
                                id: null,
                                status: 'OFFLINE',
                                socketId: null
                            },
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
                            player1: {
                                id: game.player1,
                                status: 'OFFLINE',
                                socketId: null
                            },
                            player2: {
                                id: null,
                                status: 'OFFLINE',
                                socketId: null
                            },
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

    async _startGame(socket, io, data) {
        try {
            
            const userId = socket.decoded_token.id;

            await this._checkifUserExists(userId);
            
            this._validateStartGameData(data);
            
            const gameId = data.gameId;
            let game = await this._checkifGameExists(gameId);
            
            this._checkIfUserBelongsToGame(userId, game);
            
            let redisGame = await this._redisClient.getByKey(game.id);

            if (redisGame.player1.id !== userId && redisGame.player1.status === 'ONLINE' || redisGame.player2.id !== userId && redisGame.player2.status === 'ONLINE') {
                await game.start();

                redisGame.status = 'IN_PROGRESS';
            }

            redisGame = {
                ...redisGame,
                player1: {
                    id: game.player1,
                    status: game.player1 === userId ? 'ONLINE' : redisGame.player1.status,
                    socketId: game.player1 === userId ? socket.id : redisGame.player1.socketId
                },
                player2: {
                    id: game.player2,
                    status: game.player2 === userId ? 'ONLINE' : redisGame.player2.status,
                    socketId: game.player2 === userId ? socket.id : redisGame.player2.socketId
                },
                turn: redisGame.player1.id,
                board: []
            };

            await this._redisClient.set(
                game.id,
                redisGame
            );

            socket.emit(
                'gameData',
                redisGame
            );

            if (redisGame.status === 'IN_PROGRESS') {
                io.to(redisGame.player1.id === userId ? redisGame.player2.socketId : redisGame.player1.socketId)
                    .emit(
                        'gameData',
                        redisGame
                    );
            }
        } catch (err) {
            this._logger.error('An error occured:', err);

            socket.emit('error', `An error occured: ${JSON.stringify(err)}`);
        }
    }

    async _endGame(socket, data, io) {
        try {
            const userId = socket.decoded_token.id;

            await this._checkifUserExists(userId);
            this._validateEndGameData(data);

            const gameId = data.gameId;
            const game = await this._checkifGameExists(gameId);

            this._checkIfUserBelongsToGame(userId, game);

            await game.fail();

            await this._redisClient.delete(game.id);

            socket.emit('gameFailed');

            io.to(redisGame.player1.id === userId ? redisGame.player2.socketId : redisGame.player1.socketId)
                .emit('gameFailed');

        } catch (err) {
            this._logger.error('An error occured:', err);

            socket.emit('error', `An error occured: ${JSON.stringify(err)}`);
        }
    }

    async _makeMove(socket, data) {
        try {
            const userId = socket.decoded_token.id;

            await this._checkifUserExists(userId);
            this._validateEndGameData(data);

            const gameId = data.gameId;
            const game = await this._checkifGameExists(gameId);

            this._checkIfUserBelongsToGame(userId, game);

            const redisGame = await this._redisClient.set(game.id);

            if (redisGame.turn !== userId) {
                throw new ValidationError('It is not your turn');
            }
            

        } catch (err) {
            this._logger.error('Something went wrong', err);

            socket.emit('error', `An error occured: ${JSON.stringify(err)}`);
        }
    }

    async _checkifUserExists(userId) {
        const user = await User.findById(userId);
        
        if (!user) {
            throw new NotFoundError(`User with specified id of ${userId} not found`);
        }
        return user;
    }

    async _checkifGameExists(gameId) {
        const game = await Game.findById(gameId);
        
        if (!game) {
            throw new NotFoundError(`Game with specified id of ${gameId} not found`);
        }
        return game;
    }

    _checkIfUserBelongsToGame(userId, game) {
        if (game.player1 !== userId && game.player2 !== userId) {
            throw new ValidationError('Wrong game id');
        }

        return true;
    }

    _validateFilterParams(req, next) {
        const validator = validation.validator;
        const validationRules = validator.isObject()
            .withOptional('offset', validator.isInteger({ allowString: true, min: 0 }))
            .withOptional('limit', validator.isInteger({ allowString: true, min: 1 }));

        validation.validate(validationRules, req.query, next);
    }

    _validateMoveData(data) {
        const validator = validation.validator;
        const validationRules = validator.isObject()
            .withRequired('gameId', validator.isString())
            .withRequired('from', validator.isString())
            .withRequired('to', validator.isString());

        validation.validate(validationRules, data);
    }

    _validateStartGameData(data) {
        const validator = validation.validator;
        const validationRules = validator.isObject()
            .withRequired('gameId', validator.isString());

        validation.validate(validationRules, data);
    }

    _validateEndGameData(data) {
        const validator = validation.validator;
        const validationRules = validator.isObject()
            .withRequired('gameId', validator.isString());

        validation.validate(validationRules, data);
    }
}
