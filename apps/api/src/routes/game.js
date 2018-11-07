import express from 'express';
import { GameService } from '../services';
import passport from '../lib/passport';

const router = express.Router(); // eslint-disable-line
const gameService = new GameService();

// History
router.route('/games')
    .get(passport.authenticateJwt, gameService.getGamesHistory)
    .post(passport.authenticateJwt, gameService.joinOrCreateGame);

// Socket.io
export const socketEvents = {
    'startGame': gameService.startGame,
    'endGame': gameService.endGame,
    'makeMove': gameService.makeMove
};

export default router;
