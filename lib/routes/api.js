import express from 'express';
import GameService from '../services/game';
import UserService from '../services/user';

// eslint-disable-next-line
const router = express.Router();
const gameService = new GameService();
const userService = new UserService();

// Session
router.post('/user/session/create', userService.sessionCreate);
router.post('/user/session/renew', userService.sessionRenew);

// User
router.post('/user/register', userService.registerUser);
router.post('/user/resetPassword', userService.resetUserPassword);
router.get('/user', userService.getUserInfo);
router.post('/user', userService.updateUserInfo);
router.get('/user/history', userService.getGamesHistory);

// History
router.get('/history', gameService.getGamesHistory);

// Action
router.post('/action/:actionId', userService.activateUser);

export default router;