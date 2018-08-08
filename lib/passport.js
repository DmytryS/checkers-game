import passport from 'passport';
import moment from 'moment';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import jwt from 'jsonwebtoken';
import User from './models/User';
import { UnauthorizedError } from './errorHandler';
import config from '../etc/config';
import { callbackify } from 'util';

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
                // throw new UnauthorizedError(`User with email of '${email} not found'`);
                done(`User with email of '${email} not found'`, null);
            }

            if (await user.isValidPassword(password)) {
                const token = jwt.sign(
                    {
                        userId: user.id,
                        email: user.email
                    },
                    config.secretKey,
                    {
                        expiresIn: '1m'
                    }
                );

                done(null, { token });
            } else {
                done('Wrong email or password', null);
            }
        }
    )
);
  
passport.use(
    new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'),
            secretOrKey: config.secretKey
        },
        async (token, next) => {
            const user = await User.findById(token.userId);

            if (user) {
                next(user);
            } else {
                throw new UnauthorizedError('Wrong token');
            }
        }
    )
);

module.exports = {
    initialize: () => passport.initialize(),
    authenticateJWT: async (req, res, next) => passport.authenticate('jwt', { session: false }, (err, token) => {
        if(err) {
            throw new UnauthorizedError(err);
        } else {
            res.json(token);
        }
    }),
    authenticateCredentials: (req, res, next) => passport.authenticate('local', { session: false }, (err, token) => {
        if(err) {
            next(new UnauthorizedError(err));
        } else {
            res.json(token);
        }
    })(req, res, next)
};
