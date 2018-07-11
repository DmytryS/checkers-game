'use strict';
import mongoose from 'mongoose';

let Schema = mongoose.Schema;

export default class PlayerModel {
  constructor() {
    let playerSchema = new Schema({
      name: {type: String, required: true},
      email: {type: Number, required:true},
      password: {}
    }, {usePushEach: true});

    delete mongoose.connection.models.Player;
    this._Player = mongoose.model('Film', playerSchema);
  }

  get Player() {
    return this._Player;
  }
}