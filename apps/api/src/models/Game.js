
import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const gameStatuses = {
    values: [ 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED' ],
    message: 'Game status must be either of \'PENDING\', \'IN_PROGRESS\', \'COMPLETED\', \'FAILED\''
};
const gameSchema = new Schema({
    player1: { type: String, required: true },
    player2: { type: String },
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
    findGamesWithUser: async function (userId, filterParams = {}) {
        const findParams = {
            $or: [ {
                player1: userId
            }, {
                player2: userId
            } ]
        };

        if (filterParams.status) {
            findParams.status = filterParams.status;
        }

        return await this
            .find(findParams)
            .skip(filterParams.skipRecords || 0)
            .limit(filterParams.limitRecords || 20)
            .sort('createdAt')
            .exec();
    },

    /**
     * Find pending games for user
     * @param {String} userId user id
     * @returns {Promise<Array<Game>>} promise to return with found games
     */
    findPendingGamesForUser: async function (userId) {
        return await this
            .find({
                player1: { $ne: userId },
                player2: null,
                status: 'PENDING'
            })
            .sort('createdAt')
            .exec();
    },

    /**
     * Creates new game for user
     * @param {String} userId user id
     * @returns {Promise<Game>} promise which will be resolved when game created
     */
    createNew: async function (userId) {
        return new this({
            player1: userId,
            status: 'PENDING'
        }).save();
    }
};

gameSchema.methods = {
    /**
     * Joins user to existing game
     * @param {String} userId user id
     * @returns {Promise<Game>} promise which will be resolved when joined the game
     */
    join: async function (userId) {
        this.player2 = userId;
        this.status = 'IN_PROGRESS';

        return this.save();
    }
};

delete mongoose.connection.models.Game;

module.exports = mongoose.model('Game', gameSchema);
