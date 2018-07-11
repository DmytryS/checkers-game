'use strict';
import lo4js from 'log4js';

export default class FrontService {
    constructor(){
      this._logger = lo4js.getLogger('==FRONT==');
      this._logger.level = 'debug';
    }

    get getFront() {
      return this._getFront.bind(this);
    }

    _getFront(req, res, next) {
      try {
        res.render('index', { title: 'Express' });
      } catch (err) {
        next(err);
      }
    }
}