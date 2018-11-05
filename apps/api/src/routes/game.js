import express from 'express';
import { GameService } from '../services';
import passport from '../lib/passport';

// eslint-disable-next-line
const router = express.Router();
const gameService = new GameService();

// History
router.route('/games')
    .get(passport.authenticateJwt, gameService.getGamesHistory)
    .post(passport.authenticateJwt, gameService.joinOrCreateGame);

export default router;
