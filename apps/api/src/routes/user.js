import express from 'express';
import { UserService } from '../services';
import passport from '../lib/passport';

// eslint-disable-next-line
const router = express.Router();
const userService = new UserService();


// Session
router.route('/user/session/create')
    .post(userService.sessionCreate);
router.route('/user/session/renew')
    .post(passport.authenticateJwt, userService.sessionRenew);

// User
router.route('/user/register')
    .post(userService.registerUser);
router.route('/user/resetPassword')
    .post(userService.resetUserPassword);
router.route('/user')
    .get(passport.authenticateJwt, userService.getUserInfo)
    .post(passport.authenticateJwt, userService.updateUserInfo);

// Action
router.route('/actions/:actionId')
    .get(userService.getAction)
    .post(userService.runAction);

export default router;
