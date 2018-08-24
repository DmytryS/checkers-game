
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import config from '../../config/config';

const Schema = mongoose.Schema;
const userSchema = new Schema({
    name: { type: String, unique: true, required: true },
    email: { type: String, lowercase: true, unique: true, required: true },
    passwordHash: { type: String }
}, { timestamps: true });

userSchema.methods = {
    isValidPassword: async function (candidatePassword) {
        if (!candidatePassword) {
            return false;
        }
        if (!this.passwordHash) {
            return false;
        }
        return await bcrypt.compare(candidatePassword, this.passwordHash);
    },
    setPassword: async function (password) {
        if (password) {
            this.passwordHash = await bcrypt.hash(password, config.saltRounds);
        } else {
            this.passwordHash = undefined;
        }
        return this.save();
    },
    update: async function (userObject) {
        this.name = userObject.name;
        this.email = userObject.email;

        return await this.save();
    }
};

delete mongoose.connection.models.User;

module.exports = mongoose.model('User', userSchema);
