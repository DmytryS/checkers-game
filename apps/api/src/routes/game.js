import express from 'express';
import { GameService } from '../services';

// eslint-disable-next-line
const router = express.Router();
const gameService = new GameService();

// History
router.get('/history', gameService.getGamesHistory);

export default router;
