import passport from 'passport';
import { UnauthorizedError } from '../errorHandler';
import localStrategy from './localStrategy';
import jwtStrategy from './jwtStrategy';

passport.use(localStrategy);
passport.use(jwtStrategy);

export default {
    initialize: () => passport.initialize(),
    authenticateJwt: function (req, res, next) {
        passport.authenticate('jwt', { session: false }, (err, user, info) => {
            if(err) {
                next(new UnauthorizedError(err.message ? err.message : err));
            }

            if(!user) {
                next(new UnauthorizedError(info));
            }

            req.user = user;
            next();
        })(req, res, next);
    },
    authenticateCredentials: (req) => new Promise((resolve, reject) =>
        passport.authenticate('local', { session: false }, (err, user) => {
            if(err) {
                reject(new UnauthorizedError(err.message ? err.message : err));
            }
            
            return resolve(user);
        })(req)
    )
};
