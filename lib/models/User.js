
import mongoose from 'mongoose';
import crypto from 'crypto';

let Schema = mongoose.Schema;


const userSchema = new Schema({
    name: { type: String, unique: true, required: true },
    email: { type: String, lowercase: true, unique: true, required: true },
    passwordHash: { type: String },
    salt: { type: String }
}, { timestamps: true });

userSchema.virtual('password')
    .set(function (password) {
        this._plainPassword = password;
        if (password) {
            this.salt = crypto.randomBytes(128).toString('base64');
            this.passwordHash = crypto.pbkdf2Sync(password, this.salt, 1, 128, 'sha1');
        } else {
            this.salt = undefined;
            this.passwordHash = undefined;
        }
    });

userSchema.methods = {
    checkPassword: function (password) {
        if (!password) {
            return false;
        }
        if (!this.passwordHash) {
            return false;
        }
        return crypto.pbkdf2Sync(password, this.salt, 1, 128, 'sha1') === this.passwordHash;
    }
};

delete mongoose.connection.models.User;

module.exports = mongoose.model('User', userSchema);
