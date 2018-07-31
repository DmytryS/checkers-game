import App from '../lib/service';
import request from 'supertest-promised';

const configuration = {
    db: {
        url: 'mongodb://127.0.0.1:27017/checkers-app-test'
    },
    port: 3000
};
const app = new App(configuration);
let server;

describe('UserService', () => {
    before(async () => {
        app.start();
        server = app.server;
    });
  
    after(async () => {
        app.stop();
    });
  
    beforeEach(async () => {
        await app.clearDb();
    });

    
    describe('RegisterUser', () => {  
        it('should register new user', async () => {
          const response = await request(server)
            .post('/api/v1/user')
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .send({ email: 'some@email.com', name: 'userName'})
            .expect(200)
            .end()
            .get('body');
    
          response.should.eql(filmObject);
        });
      });
})