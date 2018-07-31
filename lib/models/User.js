
import mongoose from 'mongoose';

let Schema = mongoose.Schema;

export default class UserModel {
    constructor() {
        let userSchema = new Schema({
            name: { type: String, required: true },
            email: { type: String, required: true },
            passwordHash: { type: String }
        }, { timestamps: true });

        delete mongoose.connection.models.User;
        this._User = mongoose.model('User', userSchema);
    }

    get User() {
        return this._User;
    }
}
