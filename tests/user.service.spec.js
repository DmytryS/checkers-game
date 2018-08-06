import sinon from 'sinon';
import should from 'should'; // eslint-disable-line
import App from '../lib/service';
import mailSender from '../lib/mailSender';
import request from 'supertest-promised';
import User from '../lib/models/User';

const configuration = {
    baseUrl: '/api/v1',
    db: {
        url: 'mongodb://127.0.0.1:27017/checkers-app-test'
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
    
            sinon.assert.calledWith(emailStub, { email: 'some@email.com', templateName: 'REGISTER', sendData: { actionId: sinon.match.string } });
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
});
