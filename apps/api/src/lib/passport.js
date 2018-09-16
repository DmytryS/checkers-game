import passport from 'passport';
import moment from 'moment';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { UnauthorizedError } from './errorHandler';
import config from '../../config/config';
import { dumpUser } from './utils';

passport.use(
    new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password',
            session: false
        },
        async (email, password, done) => {
            const user = await User.findOne({ email });

            if (!user) {
                done('Wrong email or password', false);
            }
            
            if (!(await user.isValidPassword(password))) {
                done('Wrong email or password', false);
            }

            const expiresIn = moment().add(1, 'day');
            const token = jwt.sign(
                dumpUser(user),
                config.secretKey,
                {
                    expiresIn: '1d'
                }
            );

            done(false, { token, expiresIn });
        }
    )
);
  
passport.use(
    new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromHeader('authorization'),
            secretOrKey: config.secretKey,
            session: false
        },
        async (tokenObject, done) => {
            if (!tokenObject || !tokenObject.id) {
                done('Wrong token', false);
            }

            const user = await User.findById(tokenObject.id);

            if (!user) {
                done('Wrong token', false);
            }

            done(false, dumpUser(user));
        }
    )
);

module.exports = {
    initialize: () => passport.initialize(),
    authenticateJwt: function (req) {
        return new Promise((resolve, reject) =>
            passport.authenticate('jwt', { session: false }, (err, user) => { // eslint-disable-line
                if(err) {
                    reject(new UnauthorizedError(err.message ? err.message : err));
                }

                this.context = user;
                resolve();
            })(req)
        );
    },
    authenticateCredentials: (req) => new Promise((resolve, reject) =>
        passport.authenticate('local', { session: false }, (err, token) => {
            if(err) {
                reject(new UnauthorizedError(err));
            }
            
            return resolve(token);
        })(req)
    )
};
