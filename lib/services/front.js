'use strict';
import logger from '../logger';

export default class FrontService {
    constructor(){
      this._logger = logger.getLogger('FRONT');
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