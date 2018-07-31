import express from 'express';
import GameService from '../services/game';
import UserService from '../services/user';

// eslint-disable-next-line
const router = express.Router();
const gameService = new GameService();
const userService = new UserService();

router.post('/user/sessions/create', userService.sessionCreate);
router.post('/user/sessions/renew', userService.sessionRenew);

router.post('/user/register', userService.register);
router.post('/user/resetPassword', userService.resetPassword);
router.get('/user', userService.getUserInfo);
router.post('/user', userService.updateUserInfo);
router.get('/user/history', userService.getGamesHistory);

router.get('/history', gameService.getGamesHistory);

export default router;
