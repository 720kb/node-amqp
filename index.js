/*global require,module*/
(function withNode(require, module) {
  'use strict';

  var amqp = require('amqplib')
    , Publisher = require('./lib/pub')(amqp)
    , Subscriber = require('./lib/sub')(amqp);

  module.exports = {
    'Publisher': Publisher,
    'Subscriber': Subscriber
  };
}(require, module));
