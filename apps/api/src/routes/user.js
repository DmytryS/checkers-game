import express from 'express';
import { UserService } from '../services';

// eslint-disable-next-line
const router = express.Router();
const userService = new UserService();

// Session
router.route('/user/session/create')
    .post(userService.sessionCreate);
router.route('/user/session/renew')
    .post(userService.sessionCheck, userService.sessionRenew);

// User
router.route('/user/register')
    .post(userService.registerUser);
router.route('/user/resetPassword')
    .post(userService.resetUserPassword);
router.route('/user')
    .get(userService.sessionCheck, userService.getUserInfo)
    .post(userService.sessionCheck, userService.updateUserInfo);

// Action
router.route('/actions/:actionId')
    .get(userService.getAction)
    .post(userService.runAction);

export default router;
