require('babel-register')({
    retainLines: true
});

const Service = require('./lib/service');
const service = new Service();

service.start();
