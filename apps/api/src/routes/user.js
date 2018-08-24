import express from 'express';
import { UserService } from '../services';

// eslint-disable-next-line
const router = express.Router();
const userService = new UserService();

// Session
router.post('/user/sessions/create', userService.sessionCreate);
router.post('/user/sessions/renew', userService.sessionCheck, userService.sessionRenew);

// User
router.post('/user/register', userService.registerUser);
router.post('/user/resetPassword', userService.resetUserPassword);
router.get('/user', userService.sessionCheck, userService.getUserInfo);
router.post('/user', userService.sessionCheck, userService.updateUserInfo);
router.get('/user/history', userService.getGamesHistory);

// Action
router.post('/action/:actionId', userService.runAction);

export default router;
