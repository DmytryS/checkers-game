import express from 'express';
import { GameService } from '../services';
import passport from '../lib/passport';
import config from '../../config/config';
import socketIoRouter from 'socket.io-events';
import socketioJwt from 'socketio-jwt';

export const socketRouter = socketIoRouter();

const router = express.Router(); // eslint-disable-line
const gameService = new GameService();

// History
router.route('/games')
    .get(passport.authenticateJwt, gameService.getGamesHistory)
    .post(passport.authenticateJwt, gameService.joinOrCreateGame);

// Socket.io
socketRouter
    .on(
        'connection',
        socketioJwt.authorize({
            secret: config.secretKey,
            timeout: 15000
        })
    )
    .on(
        'authenticated',
        (socket) => {
            socket.on('startGame', gameService.startGame);
            socket.on('endGame', gameService.endGame);
            socket.on('makeMove', gameService.makeMove);
        }
    );

export default router;
