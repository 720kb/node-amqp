/*global global,require,module*/
(function withNode(global, require, module) {
  'use strict';

  module.exports = function exportingFunction(amqp, amqpConfiguration) {

    var util = require('util')
      , EventEmitter = require('events')
      , AmqpPublish = function AmqpPublish() {
        EventEmitter.call(this);
        var that = this;

        amqp.connect(amqpConfiguration.host, amqpConfiguration.socketOptions).then(function onConnection(connection) {

          that.on('amqp:close-connection', function onConnectionClose() {

            connection.close();
          });

          connection.on('close', function onConnectionClosed() {

            that.emit('amqp:closed');
          });

          connection.on('blocked', function onConnectionClosed() {

            that.emit('amqp:blocked');
          });

          connection.on('unblocked', function onConnectionClosed() {

            that.emit('amqp:unblocked');
          });
          return connection.createChannel();
        }).then(function onChannelCreated(channel) {

          channel.assertExchange(amqpConfiguration.exchangeName, 'fanout', {
            'durable': false
          }).then(function publish() {

            // jscs:disable disallowDanglingUnderscores
            /*eslint-disable no-underscore-dangle*/
            that.__channel__ = channel;
            /*eslint-enable no-underscore-dangle*/
            // jscs:enable disallowDanglingUnderscores
          });
        });
      };

    util.inherits(AmqpPublish, EventEmitter);
    AmqpPublish.prototype.closeConnection = function closeConnection() {

      this.emit('amqp:close-connection');
    };

    AmqpPublish.prototype.send = function send(data) {

      if (!data) {

        throw new Error('You must provide a valid payload to send');
      }

      if (typeof data === 'object') {

        data = JSON.stringify(data);
      }

      var dataToSend = new global.Buffer(data);
      // jscs:disable disallowDanglingUnderscores
      /*eslint-disable no-underscore-dangle*/
      this.__channel__.publish(amqpConfiguration.exchangeName, '', dataToSend);
      /*eslint-enable no-underscore-dangle*/
      // jscs:enable disallowDanglingUnderscores
    };

    AmqpPublish.prototype.close = function close() {

      // jscs:disable disallowDanglingUnderscores
      /*eslint-disable no-underscore-dangle*/
      this.__channel__.close();
      /*eslint-enable no-underscore-dangle*/
      // jscs:enable disallowDanglingUnderscores
    };

    return AmqpPublish;
  };
}(global, require, module));
