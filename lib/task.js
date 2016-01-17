/*global global,require,module*/
(function withNode(global, require, module) {
  'use strict';

  const AmpqConnection = require('./connection')
    , amqpConfigurationSym = Symbol('amqpConfiguration')
    , channelSym = Symbol('channel');

  module.exports = function exportingFunction(amqp) {

    // jscs:disable disallowAnonymousFunctions
    // jscs:disable requireNamedUnassignedFunctions
    class AmpqTask extends AmpqConnection {

      constructor(amqpConfiguration) {

        super(amqp, amqpConfiguration);
        this[amqpConfigurationSym] = amqpConfiguration;
        this.on('amqp:channel-ready', channel => {

          this[channelSym] = channel;
          channel.assertQueue(amqpConfiguration.queueName, {
            'durable': true
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
        let dataToSend = new global.Buffer(data)
          , queueParameters = {
            'deliveryMode': true
          };

        if (this[channelSym]) {

          this[channelSym].sendToQueue(this[amqpConfigurationSym].queueName, dataToSend, queueParameters);
        } else {

          this.on('amqp:ready', channel => {

            channel.sendToQueue(this[amqpConfigurationSym].queueName, dataToSend, queueParameters);
          });
        }
      }
    }
    // jscs:enable disallowAnonymousFunctions
    // jscs:enable requireNamedUnassignedFunctions

    return AmpqTask;
  };
}(global, require, module));
