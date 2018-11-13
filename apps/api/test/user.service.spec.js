import sinon from 'sinon';
import should from 'should'; // eslint-disable-line
import App from '../src/lib/service';
import mailSender from '../src/lib/mailSender';
import request from 'supertest-promised';
import { User, Action } from '../src/models';

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
const app = new App(configuration);
let server;
let sandbox;

describe('UserService', () => {
    before(async () => {
        await app.start();
        server = app.server;
        sandbox = sinon.createSandbox();
    });
  
    after(async () => {
        await app.stop();
    });
  
    beforeEach(async () => {
        await app.clearDb();
        sandbox.restore();
    });
    
    describe('RegisterUser', () => {
        it('Should return 200 if registered new user', async () => {
            const emailStub = sandbox.stub(mailSender, 'send').returns(Promise.resolve());
            
            await request(server)
                .post('/api/v1/user/register')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({ email: 'some@email.com', name: 'userName' })
                .expect(200)
                .end();
    
            sinon.assert.calledWith(
                emailStub,
                'some@email.com',
                'REGISTER',
                {
                    actionId: sinon.match.string,
                    name: 'userName',
                    uiUrl: 'http://localhost'
                }
            );
        });

        it('Should return 400 if user with provided email alredy exists', async () => {
            const emailStub = sandbox.stub(mailSender, 'send').returns(Promise.resolve());
            
            await new User({ email: 'existing@mail.com', name: 'Petro' }).save();
            
            const response = await request(server)
                .post('/api/v1/user/register')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({ email: 'existing@mail.com', name: 'Alexander' })
                .expect(400)
                .end()
                .get('body');

            response.should.eql({
                error: 'ValidationError',
                message: 'User with email of \'existing@mail.com\' already exists'
            });
            emailStub.notCalled.should.be.true();
        });

        it('Should return 400 if user with provided name alredy exists', async () => {
            const emailStub = sandbox.stub(mailSender, 'send').returns(Promise.resolve());
            
            await new User({ email: 'existing@mail.com', name: 'Petro' }).save();
            
            const response = await request(server)
                .post('/api/v1/user/register')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({ email: 'another@mail.com', name: 'Petro' })
                .expect(400)
                .end()
                .get('body');

            response.should.eql({
                error: 'ValidationError',
                message: 'User with name of \'Petro\' already exists'
            });
            emailStub.notCalled.should.be.true();
        });
    });

    describe('ActivateUser', () => {
        it('Should return 200 if user activated', async () => {
            const user = await new User({ email: 'some@mail.com', name: 'Dmytry' }).save();
            const action = await Action.create({ userId: user.id, type: 'REGISTER' });

            await request(server)
                .put(`/api/v1/actions/${action.id}`)
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({ password: 'SomePassword123' })
                .expect(200)
                .end();
        });
        
        it('should return 404 if action not exists', async () => {
            await request(server)
                .put('/api/v1/actions/aaaaaaaaaaaaaaaaaaaaaaaa')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({ password: 'SomePassword123' })
                .expect(404)
                .end();
        });
    });

    describe('RestoreUserPassword', () => {
        it('Should return 200 if reset password email sent', async () => {
            const emailStub = sandbox.stub(mailSender, 'send').returns(Promise.resolve());

            await new User({ email: 'some@mail.com', name: 'Dmytry' }).save();

            await request(server)
                .post('/api/v1/user/resetPassword')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({ email: 'some@mail.com' })
                .expect(200)
                .end();

            sinon.assert.calledWith(
                emailStub,
                'some@mail.com',
                'RESET_PASSWORD',
                {
                    actionId: sinon.match.string,
                    name: 'Dmytry',
                    uiUrl: 'http://localhost'
                }
            );
        });
        
        it('Should return 404 if user not found', async () => {
            await request(server)
                .post('/api/v1/user/resetPassword')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({ email: 'other@mail.com' })
                .expect(404)
                .end();
        });
    });

    describe('Show action', () => {
        it('Should return 200 if returned action', async () => {
            const action = await new Action({
                userId: 'aaaaaaaaaaaaaaaaaaaaaaaa',
                type: 'REGISTER'
            }).save();

            const response = await request(server)
                .get(`/api/v1/actions/${action.id}`)
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .expect(200)
                .end()
                .get('body');

            sinon.assert.match(
                response,
                {
                    id: sinon.match.string,
                    type: 'REGISTER',
                    userId: 'aaaaaaaaaaaaaaaaaaaaaaaa'
                });
        });

        it('Should return 404 if action not found', async () => {
            await request(server)
                .get('/api/v1/actions/aaaaaaaaaaaaaaaaaaaaaaaa')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({ email: 'other@mail.com' })
                .expect(404)
                .end();
        });
    });

    describe('SessionCreate', () => {
        it('should return 200 if session created', async () => {
            const user = await new User({ email: 'some@mail.com', name: 'Dmytry' }).save();

            await user.setPassword('password');

            const response = await request(server)
                .post('/api/v1/user/session/create')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({ email: 'some@mail.com', password: 'password' })
                .expect(200)
                .end()
                .get('body');

            sinon.assert.match(
                response,
                {
                    token: sinon.match.string,
                    expiresIn: sinon.match.string
                }
            );
        });

        it('should return 401 if failed to create session', async () => {
            await request(server)
                .post('/api/v1/user/session/create')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({ email: 'some123@mail.com', password: 'password123' })
                .expect(401)
                .end();
        });
    });

    describe('SessionRenew', () => {
        it('should return 200 if renewed token', async () => {
            const user = await new User({ email: 'some@mail.com', name: 'Dmytry' }).save();

            await user.setPassword('somePass');
            
            const { token } = await request(server)
                .post('/api/v1/user/session/create')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({ email: 'some@mail.com', password: 'somePass' })
                .expect(200)
                .end()
                .get('body');

            const result = await request(server)
                .put('/api/v1/user/session/renew')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .set('Authorization', token)
                .send()
                .expect(200)
                .end()
                .get('body');

            sinon.assert.match(
                result,
                {
                    token: sinon.match.string,
                    expiresIn: sinon.match.string
                }
            );
        });
    });

    describe('UserInfo', async () => {
        it('should return 200 if returned user info', async () => {
            const user = await new User({ email: 'some@mail.com', name: 'Dmytry' }).save();

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
                .get('/api/v1/user')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .set('Authorization', token)
                .send()
                .expect(200)
                .end()
                .get('body');

            sinon.assert.match(
                response,
                {
                    id: sinon.match.string,
                    email: 'some@mail.com',
                    name: 'Dmytry',
                    createdAt: sinon.match.string,
                    updatedAt: sinon.match.string
                }
            );
        });
    });

    describe('UserUpdate', async () => {
        it('should return 200 if user updated', async () => {
            const user = await new User({ email: 'some@mail.com', name: 'Dmytry' }).save();

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
                .put('/api/v1/user')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .set('Authorization', token)
                .send({ email: 'other@mail.com', name: 'Petrovich' })
                .expect(200)
                .end()
                .get('body');

    
            sinon.assert.match(
                response,
                {
                    id: sinon.match.string,
                    email: 'other@mail.com',
                    name: 'Petrovich',
                    createdAt: sinon.match.string,
                    updatedAt: sinon.match.string
                });
        });
        
        it('should return 400 if failed to update user when email already exists', async () => {
            const user = await new User({ email: 'some@mail.com', name: 'Dmytry' }).save();

            await user.setPassword('somePass');
            const { token } = await request(server)
                .post('/api/v1/user/session/create')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({ email: 'some@mail.com', password: 'somePass' })
                .expect(200)
                .end()
                .get('body');

            await new User({ email: 'other@mail.com', name: 'Dmytry' }).save();

            await request(server)
                .put('/api/v1/user')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .set('Authorization', token)
                .send({ email: 'other@mail.com', name: 'Petrovich' })
                .expect(400)
                .end();
        });
    });
});
