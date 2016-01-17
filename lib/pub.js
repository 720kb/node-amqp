/*global global,require,module*/
(function withNode(global, require, module) {
  'use strict';

  const AmpqConnection = require('./connection')
    , amqpConfigurationSym = Symbol('amqpConfiguration')
    , channelSym = Symbol('channel');

  module.exports = function exportingFunction(amqp) {

    // jscs:disable disallowAnonymousFunctions
    // jscs:disable requireNamedUnassignedFunctions
    class AmpqPublish extends AmpqConnection {

      constructor(amqpConfiguration) {

        super(amqp, amqpConfiguration);
        this[amqpConfigurationSym] = amqpConfiguration;
        this.on('amqp:channel-ready', channel => {

          this[channelSym] = channel;
          channel.assertExchange(amqpConfiguration.exchangeName, 'fanout', {
            'durable': false
          })
          .then(() => {

            this.emit('amqp:ready', channel);
          })
          .catch(err => {

            throw new Error(err);
          });
        });
      }

      send(data) {

        if (!data) {

          throw new Error('You must provide a valid payload to send');
        }
        let dataToSend = new global.Buffer(data);

        if (this[channelSym]) {

          this[channelSym].publish(this[amqpConfigurationSym].exchangeName, '', dataToSend);
        } else {

          this.on('amqp:ready', (channel) => {

            channel.publish(this[amqpConfigurationSym].exchangeName, '', dataToSend);
          });
        }
      }
    }
    // jscs:enable disallowAnonymousFunctions
    // jscs:enable requireNamedUnassignedFunctions

    return AmpqPublish;
  };
}(global, require, module));
