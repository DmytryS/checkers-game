import express from 'express';
import { GameService, UserService } from '../services';

// eslint-disable-next-line
const router = express.Router();
const gameService = new GameService();
const userService = new UserService();

// History
router.get('/games', userService.sessionCheck, gameService.getGamesHistory);

export default router;
