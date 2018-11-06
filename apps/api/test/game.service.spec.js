import sinon from 'sinon';
import should from 'should'; // eslint-disable-line
import App from '../src/lib/service';
import request from 'supertest-promised';
import socketIoClient from 'socket.io-client';
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
let ioClient;
let sandbox;

describe('GameService', () => {
    before(async () => {
        await app.start();
        server = app.server;
        ioClient = socketIoClient('http://localhost:3000', ioOptions);
        sandbox = sinon.createSandbox();
    });
  
    after(async () => {
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
            const user = await new User({
                email: 'some@mail.com',
                name: 'Dmytry'
            }).save();

            await user.setPassword('somePass');

            const pedingGame = await new Game({
                player1: 'aaaaaaaaaaaaaaaaaaaaaaaa',
                player2: user.id,
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

            console.log(555555555555555555555555555555555555555555555555555555555555555555555555555555);

            ioClient.on('connect', () => {
                console.log(999999999999999999999999999999999999999999999999999999999999999999999);
                ioClient.emit('clientEvent', 'Я еще не отослал свой токен');
                ioClient
                    .emit('authenticate', { token: '123' })
                    .on('authenticated', () => {
                        console.log(22222222222222222222222222222222222222222222222222222);
                        ioClient.emit('startGame', { gameId: pedingGame.id, user });
                        done();
                    })
                    .on('unauthorized', (msg) => {
                        console.log(444444444444444444444444444444444444444444444444444444);
                        console.log(`unauthorized: ${ JSON.stringify(msg.data)}`);
                        done()

                    });
            });
        });
    });
});
