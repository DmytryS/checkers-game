'use strict';
import express from 'express';
import GameService from '../services/game';
import ProfileService from '../services/profile';

const router = express.Router();
const gameService = new GameService();
const profileService = new ProfileService();

router.post('/player/sessions/create', profileService.sessionCreate);
router.post('/player/sessions/renew', profileService.sessionRenew);

router.post('/player/profile/register', profileService.register);
router.post('/player/profile/resetPassword', profileService.resetPassword);
router.get('/player/profile', profileService.getProfileInfo);
router.post('/player/profile', profileService.updateProfileInfo);
router.get('/player/profile/history', profileService.getGamesHistory);

router.get('/history', gameService.getGamesHistory);

export default router;
