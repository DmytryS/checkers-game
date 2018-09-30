import { Strategy as LocalStrategy } from 'passport-local';
import { User } from '../../models';
import { dumpUser } from '../utils';

export default new LocalStrategy(
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
        
        if (!await user.isValidPassword(password)) {
            done('Wrong email or password', false);
        }

        done(false, dumpUser(user));
    }
);
