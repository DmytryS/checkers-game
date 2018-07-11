'use strict';
import express from 'express';
import FrontService from '../services/front';

const router = express.Router();
const frontService = new FrontService();

router.get('/', frontService.getFront);

export default router;
