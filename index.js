/*global require,module*/
(function withNode(require, module) {
  'use strict';

  const amqp = require('amqplib')
    , Publisher = require('./lib/pub')(amqp)
    , Subscriber = require('./lib/sub')(amqp)
    , Task = require('./lib/task')(amqp)
    , Worker = require('./lib/worker')(amqp);

  module.exports = {
    Publisher,
    Subscriber,
    Task,
    Worker
  };
}(require, module));
