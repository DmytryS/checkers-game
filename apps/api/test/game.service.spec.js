import sinon from 'sinon';
import should from 'should'; // eslint-disable-line
import App from '../src/lib/service';
import request from 'supertest-promised';
import io from 'socket.io-client';
import { User, Game } from '../src/models';

const configuration = {
    baseUrl: '/api/v1',
    db: {
        url: 'mongodb://127.0.0.1:27017/checkers-be-test'
    },
    logger: {
        path: 'logs',
        filename: 'checkers-be-test.log'
    },
    mail: {
        from: 'user@gmail.com',
        /* eslint-disable-next-line*/
        transport_options: {
            host: 'smpt.gmail.com',
            service: 'Gmail',
            auth: {
                user: 'mail@gmail.com',
                pass: 'password'
            }
        }
    },
    port: 3000
};
const ioOptions = {
    transports: [ 'websocket' ],
    forceNew: true,
    reconnection: false
};
const app = new App(configuration);
let server;
let socket;
let sandbox;

describe('GameService', () => {
    before(async () => {
        await app.start();
        server = app.server;
        socket = io.connect(`http://localhost:${configuration.port}`, ioOptions);
        sandbox = sinon.createSandbox();
    });
  
    after(async () => {
        await app.clearDb();
        await app.stop();
    });
  
    beforeEach(async () => {
        await app.clearDb();
        sandbox.restore();
    });

    describe('Get games history', () => {
        it('Should return 200 if returned played games list', async () => {
            const user = await new User({
                email: 'some@mail.com',
                name: 'Dmytry'
            }).save();

            await user.setPassword('somePass');

            const { token } = await request(server)
                .post('/api/v1/user/session/create')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({ email: 'some@mail.com', password: 'somePass' })
                .expect(200)
                .end()
                .get('body');

            await new Game({
                player1: user.id,
                player2: 'aaaaaaaaaaaaaaaaaaaaaaaa',
                winner: user.id,
                status: 'COMPLETED'
            }).save();
            await new Game({
                player1: 'aaaaaaaaaaaaaaaaaaaaaaaa',
                player2: user.id,
                status: 'FAILED'
            }).save();

            const response = await request(server)
                .get('/api/v1/games')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .set('Authorization', token)
                .expect(200)
                .end()
                .get('body');

            sinon.assert.match(
                response,
                [ {
                    id: sinon.match.string,
                    player1: user.id,
                    player2: 'aaaaaaaaaaaaaaaaaaaaaaaa',
                    winner: user.id,
                    status: 'COMPLETED',
                    createdAt: sinon.match.string,
                    updatedAt: sinon.match.string
                }, {
                    id: sinon.match.string,
                    player1: 'aaaaaaaaaaaaaaaaaaaaaaaa',
                    player2: user.id,
                    winner: null,
                    status: 'FAILED',
                    createdAt: sinon.match.string,
                    updatedAt: sinon.match.string
                } ]
            );
        });

        it('Should return 200 if created game', async () => {
            const user = await new User({
                email: 'some@mail.com',
                name: 'Dmytry'
            }).save();

            await user.setPassword('somePass');

            const { token } = await request(server)
                .post('/api/v1/user/session/create')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({ email: 'some@mail.com', password: 'somePass' })
                .expect(200)
                .end()
                .get('body');

            const response = await request(server)
                .post('/api/v1/games')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .set('Authorization', token)
                .expect(200)
                .end()
                .get('body');

            sinon.assert.match(
                response,
                {
                    id: sinon.match.string,
                    player1: user.id,
                    player2: null,
                    winner: null,
                    status: 'PENDING',
                    createdAt: sinon.match.string,
                    updatedAt: sinon.match.string
                }
            );
        });

        it('Should return 200 if joined game', async () => {
            const user = await new User({
                email: 'some@mail.com',
                name: 'Dmytry'
            }).save();

            await user.setPassword('somePass');

            const pedingGame = await new Game({
                player1: 'aaaaaaaaaaaaaaaaaaaaaaaa',
                player2: null,
                status: 'PENDING'
            }).save();

            const { token } = await request(server)
                .post('/api/v1/user/session/create')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({ email: 'some@mail.com', password: 'somePass' })
                .expect(200)
                .end()
                .get('body');

            const response = await request(server)
                .post('/api/v1/games')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .set('Authorization', token)
                .expect(200)
                .end()
                .get('body');

            sinon.assert.match(
                response,
                {
                    id: pedingGame.id,
                    player1: 'aaaaaaaaaaaaaaaaaaaaaaaa',
                    player2: user.id,
                    winner: null,
                    status: 'IN_PROGRESS',
                    createdAt: sinon.match.string,
                    updatedAt: sinon.match.string
                }
            );
        });

        it.only('Should start game through socket', async (done) => {
            const user1 = await new User({
                email: 'somePlayer1@mail.com',
                name: 'Dmytry'
            }).save();
            const user2 = await new User({
                email: 'somePlayer2@mail.com',
                name: 'Vasya'
            }).save();

            await user1.setPassword('somePass');
            await user2.setPassword('somePass');

            const { token: player1Token } = await request(server)
                .post('/api/v1/user/session/create')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({ email: 'somePlayer1@mail.com', password: 'somePass' })
                .expect(200)
                .end()
                .get('body');

            const { token: player2Token } = await request(server)
                .post('/api/v1/user/session/create')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({ email: 'somePlayer2@mail.com', password: 'somePass' })
                .expect(200)
                .end()
                .get('body');


            const pedingGame = await request(server)
                .post('/api/v1/games')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .set('Authorization', player1Token)
                .expect(200)
                .end()
                .get('body');

            await request(server)
                .post('/api/v1/games')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .set('Authorization', player2Token)
                .end();

            socket
                .emit('authenticate', { token: player1Token })
                .on('authenticated', () => {
                    socket
                        .emit('startGame', { gameId: pedingGame.id })
                        .on('gameData', (gameData1) => {
                            sinon.assert.match(
                                gameData1,
                                {
                                    player1: {
                                        id: user1.id,
                                        status: 'ONLINE',
                                        socketId: socket.id
                                    },
                                    player2: {
                                        id: user2.id,
                                        status: 'OFFLINE',
                                        socketId: null
                                    },
                                    status: 'PENDING',
                                    board: []
                                });

                            const socketTwo = io.connect(`http://localhost:${configuration.port}`, ioOptions);

                            socketTwo.on('connect', () => {
                                socketTwo
                                    .emit('authenticate', { token: player2Token })
                                    .on('authenticated', () => {
                                        socketTwo
                                            .emit('startGame', { gameId: pedingGame.id })
                                            .on('gameData', (gameData2) => {
                                                sinon.assert.match(
                                                    gameData2,
                                                    {
                                                        player1: {
                                                            id: user1.id,
                                                            status: 'ONLINE',
                                                            socketId: socket.id
                                                        },
                                                        player2: {
                                                            id: user2.id,
                                                            status: 'ONLINE',
                                                            socketId: socketTwo.id
                                                        },
                                                        status: 'IN_PROGRESS',
                                                        board: []
                                                    });

                                                done();
                                            })
                                            .on('error', (msg) => {
                                                done(msg);
                                            });
                                    })
                                    .on('unauthorized', (msg) => {
                                        console.log(555555555555555555555555555, msg);
                                        
                                        done(msg);
                                    });
                            });
                        })
                        .on('error', (msg) => {
                            console.log(555555555555555555555555555, msg);

                            done(msg);
                        });
                })
                .on('unauthorized', (msg) => {
                    done(msg);
                });

            
        });
    });
});
