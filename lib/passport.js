import passport from 'passport';
import moment from 'moment';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import jwt from 'jsonwebtoken';
import User from './models/User';
import { UnauthorizedError } from './errorHandler';
import config from '../etc/config';
import { dumpUser } from './services/utils';

passport.use(
    new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password',
            session: false
        },
        async (email, password, next) => {
            const user = await User.findOne({ email });

            if (!user) {
                next(`User with email of '${email} not found'`, null);
            }

            if (await user.isValidPassword(password)) {
                const expiresIn = moment().add(1, 'day');
                const token = jwt.sign(
                    dumpUser(user),
                    config.secretKey,
                    {
                        expiresIn: '1d'
                    }
                );

                next(null, { token, expiresIn });
            } else {
                next('Wrong email or password', null);
            }
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
        async (token, next) => {
            if (!token || !token.id) {
                next('Wrong token', null);
            }
            const user = await User.findById(token.id);

            if (user) {
                next(null, user);
            } else {
                next('Wrong token', null);
            }
        }
    )
);

module.exports = {
    initialize: () => passport.initialize(),
    authenticateJwt: async function (req, res, next) {
        (passport.authenticate('jwt', { session: false }, (arg1, user, err, arg4) => {
            if(err) {
                next(new UnauthorizedError(err.message ? err.message : err));
            } else {
                this.context = dumpUser(user);
                next();
            }
        }))(req, res, next);
    },
    authenticateCredentials: (req, res, next) => passport.authenticate('local', { session: false }, (err, token) => {
        if(err) {
            next(new UnauthorizedError(err));
        } else {
            res.json(token);
        }
    })(req, res, next)
};
