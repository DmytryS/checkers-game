import sinon from 'sinon';
import should from 'should'; // eslint-disable-line
import App from '../lib/service';
import mailSender from '../lib/mailSender';
import request from 'supertest-promised';
import User from '../lib/models/User';
import Action from '../lib/models/Action';

const configuration = {
    baseUrl: '/api/v1',
    db: {
        url: 'mongodb://127.0.0.1:27017/checkers-be-test'
    },
    logger: {
        path: 'logs',
        filename: 'checkers-game-test.log'
    },
    port: 3000
};
const app = new App(configuration);
let server;
let sandbox;

describe('UserService', () => {
    before(async () => {
        app.start();
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
        it('should register new user', async () => {
            const emailStub = sandbox.stub(mailSender, 'send').returns(Promise.resolve());
            const response = await request(server)
                .post('/api/v1/user/register')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({ email: 'some@email.com', name: 'userName' })
                .expect(200)
                .end()
                .get('body');
    
            sinon.assert.calledWith(emailStub, { email: 'some@email.com', templateName: 'REGISTER', sendData: { actionId: sinon.match.string, name: 'userName' } });
            response.should.have.property('id');
        });

        it('should return 400 if user with provided email alredy exists', async () => {
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

        it('should return 400 if user with provided name alredy exists', async () => {
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
        it('should return 200 if user activated', async () => {
            const user = await new User({ email: 'some@mail.com', name: 'Dmytry' }).save();
            const action = await new Action({ userId: user.id, type: 'REGISTER' }).save();

            await request(server)
                .post(`/api/v1/action/${action.id}`)
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({ password: 'SomePassword123' })
                .expect(200)
                .end();
        });
        
        it('should return 404 if action not exists', async () => {
            await request(server)
                .post('/api/v1/action/aaaaaaaaaaaaaaaaaaaaaaaa')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({ password: 'SomePassword123' })
                .expect(404)
                .end();
        });
    });

    describe('RestoreUserPassword', () => {
        it('should return 200 if reset password email sent', async () => {
            const emailStub = sandbox.stub(mailSender, 'send').returns(Promise.resolve());

            await new User({ email: 'some@mail.com', name: 'Dmytry' }).save();

            await request(server)
                .post('/api/v1/user/resetPassword')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({ email: 'some@mail.com' })
                .expect(200)
                .end();

            sinon.assert.calledWith(emailStub, { email: 'some@mail.com', templateName: 'RESET_PASSWORD', sendData: { actionId: sinon.match.string, name: 'Dmytry' } });
        });
        
        it('should return 404 if user not found', async () => {
            await request(server)
                .post('/api/v1/user/resetPassword')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({ email: 'other@mail.com' })
                .expect(404)
                .end();
        });
    });

    describe.only('SessionCreate', () => {
        it('should return 200 if session created', async () => {
            const user = await new User({ email: 'some@mail.com', name: 'Dmytry' }).save();

            await user.setPassword('password');
            await user.save();

            const result = await request(server)
                .post('/api/v1/user/session/create')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({ email: 'some@mail.com', password: 'password' })
                .expect(200)
                .end()
                .get('body');

            console.log(JSON.stringify(result));

        });
    });

    describe('SessionRenew', () => {
        it('should return 200 if reset password email sent', async () => {
            const emailStub = sandbox.stub(mailSender, 'send').returns(Promise.resolve());

            await new User({ email: 'some@mail.com', name: 'Dmytry' }).save();

            await request(server)
                .post('/api/v1/user/resetPassword')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({ email: 'some@mail.com', name: 'Dmytry' })
                .expect(200)
                .end();

            sinon.assert.calledWith(emailStub, { email: 'some@mail.com', templateName: 'RESET_PASSWORD', sendData: { actionId: sinon.match.string, name: 'Dmytry' } });
        });
    });
});
