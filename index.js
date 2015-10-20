/*global require,module*/
(function withNode(require, module) {
  'use strict';

  var amqp = require('amqplib')
    , Publisher = require('./lib/amqp-pub').bind(undefined, amqp).Publisher
    , Subscriber = require('./lib/amqp-sub').bind(undefined, amqp).Subscriber;

  module.exports = {
    'Publisher': Publisher,
    'Subscriber': Subscriber
  };
}(require, module));
