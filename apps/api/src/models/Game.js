
import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const gameStatuses = {
    values: [ 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED' ],
    message: 'Game status must be either of \'PENDING\', \'IN_PROGRESS\', \'COMPLETED\', \'FAILED\''
};
const gameSchema = new Schema({
    player1: { type: String, required: true },
    player2: { type: String, required: true },
    winner: { type: String },
    status: { type: String, enum: gameStatuses, required: true }
}, { timestamps: true });

gameSchema.statics = {
    /**
     * Find all games where user participated
     * @param {String} userId user id
     * @param {Object} filterParams object with parameters for finding games
     * @returns {Promise<Array<Game>>} promise to return with found games
     */
    findGamesWithUser: async function (userId, filterParams) {
        return await this
            .aggregate()
            .skip(filterParams.skipRecords || 0)
            .limit(filterParams.limitRecords || 20)
            .find({
                $or: [ {
                    player1: userId
                }, {
                    player2: userId
                } ]
            })
            .exec();
    }
};

delete mongoose.connection.models.Game;

module.exports = mongoose.model('Game', gameSchema);
