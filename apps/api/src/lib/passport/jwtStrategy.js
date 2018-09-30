import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { User } from '../../models';
import config from '../../../config/config';
import { dumpUser } from '../utils';

export default new JwtStrategy(
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
);
