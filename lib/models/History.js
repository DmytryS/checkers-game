
import mongoose from 'mongoose';

let Schema = mongoose.Schema;


const HistorySchema = new Schema({
    player1: { type: String, required: true },
    player2: { type: Number, required: true },
    winner: {}
}, { timestamps: true });

delete mongoose.connection.models.History;

module.exports = mongoose.model('History', HistorySchema);
