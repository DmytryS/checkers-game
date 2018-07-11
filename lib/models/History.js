'use strict';
import mongoose from 'mongoose';

let Schema = mongoose.Schema;

export default class HistoryModel {
  constructor() {
    let historySchema = new Schema({
      player1: {type: String, required: true},
      player2: {type: Number, required:true},
      winner: {}
    }, {usePushEach: true});

    delete mongoose.connection.models.History;
    this._History = mongoose.model('History', historySchema);
  }

  get History() {
    return this._History;
  }
}