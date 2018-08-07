
import mongoose from 'mongoose';

let Schema = mongoose.Schema;

const actionTypes = {
    values: [ 'REGISTER', 'RESET_PASSWORD', 'NOTIFICATION' ],
    message: 'Action type must be either of \'REGISTER\', \'RESET_PASSWORD\', \'NOTIFICATION\''
};
const ActionSchema = new Schema({
    userId: { type: String, required: true },
    type: { type: String, enum: actionTypes, required: true }
}, { timestamps: true });

delete mongoose.connection.models.Action;

module.exports = mongoose.model('Action', ActionSchema);
