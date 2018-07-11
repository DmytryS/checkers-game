'use strict';
import mongoose from 'mongoose';

let Schema = mongoose.Schema;

export default class AсtionModel {
  constructor() {
    let actionSchema = new Schema({
      token: {type: String, required: true},
      playerId: {type: Number, required:true},
      type: {}
    }, {usePushEach: true});

    delete mongoose.connection.models.Action;
    this._Action = mongoose.model('Action', actionSchema);
  }

  get Action() {
    return this._Action;
  }
}