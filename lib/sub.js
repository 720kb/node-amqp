/*global global,require,module,process*/
(function withNode(global, require, module, process) {
  'use strict';

  const EventEmitter = require('events');

  module.exports = function exportingFunction(amqp) {

    if (!amqp) {

      throw new Error('amqp driver is invalid');
    }

    // jscs:disable disallowAnonymousFunctions
    // jscs:disable requireNamedUnassignedFunctions
    class AmpqSubscribe extends EventEmitter {

      constructor(amqpConfiguration) {
        if (!amqpConfiguration) {

          throw new Error('Amqp configurations are invalid');
        }
        super();

        /*eslint-disable no-undef */
        /*jshint ignore:start */
        if (new.target === AmpqSubscribe) {

          throw new TypeError('Cannot construct AmpqSubscribe instances directly');
        }
        /*jshint ignore:end */
        /*eslint-enable no-undef */

        if (this.onMessage === undefined ||
          !(this.onMessage instanceof global.Function)) {

          throw new TypeError('Must override method onMessage an this must be a function');
        }
        amqp.connect(amqpConfiguration.host, amqpConfiguration.socketOptions)
        .then(connection => {

          return connection.createChannel();
        })
        .then(channel => {

          return channel.assertExchange(amqpConfiguration.exchangeName, 'fanout', {
            'durable': false
          })
          .then(() => {

            return channel;
          });
        })
        .then(channel => {
          return channel.assertQueue('', {
            'exclusive': true
          })
          .then((qok) => {

            return {
              'channel': channel,
              'qok': qok
            };
          });
        })
        .then(channelAndQok => {

          return channelAndQok.channel.bindQueue(channelAndQok.qok.queue, amqpConfiguration.exchangeName, '')
          .then(() => {

            return {
              'channel': channelAndQok.channel,
              'queue': channelAndQok.qok.queue
            };
          });
        })
        .then(channelAndQueue => {

          return channelAndQueue.channel.consume(channelAndQueue.queue, this.onMessage, {
            'noAck': true
          });
        })
        .then(consumeInformations => {

          this.emit('amqp:subscriber-ready', consumeInformations);
        });
      }
    }
    // jscs:enable disallowAnonymousFunctions
    // jscs:enable requireNamedUnassignedFunctions

    return AmpqSubscribe;
  };
}(global, require, module, process));
