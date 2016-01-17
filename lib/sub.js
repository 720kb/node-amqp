/*global global,require,module*/
(function withNode(global, require, module) {
  'use strict';

  const AmpqConnection = require('./connection');

  module.exports = function exportingFunction(amqp) {

    // jscs:disable disallowAnonymousFunctions
    // jscs:disable requireNamedUnassignedFunctions
    class AmpqSubscribe extends AmpqConnection {

      constructor(amqpConfiguration) {

        super(amqp, amqpConfiguration);

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

        this.on('amqp:channel-ready', channel => {

          channel.assertExchange(amqpConfiguration.exchangeName, 'fanout', {
            'durable': false
          })
          .then(() => {

            return channel.assertQueue('', {
              'exclusive': true
            });
          })
          .then(qok => {

            return channel.bindQueue(qok.queue, amqpConfiguration.exchangeName, '')
            .then(() => {

              return qok.queue;
            });
          })
          .then(queue => {

            return channel.consume(queue, this.onMessage.bind(this), {
              'noAck': true
            });
          })
          .then(consumeInformations => {

            this.emit('amqp:ready', consumeInformations);
          })
          .catch(err => {

            throw new Error(err);
          });
        });
      }
    }
    // jscs:enable disallowAnonymousFunctions
    // jscs:enable requireNamedUnassignedFunctions

    return AmpqSubscribe;
  };
}(global, require, module));
