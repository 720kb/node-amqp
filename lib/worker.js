/*global global,require,module*/
(function withNode(global, require, module) {
  'use strict';

  const AmpqConnection = require('./connection')
    , amqpConfigurationSym = Symbol('amqpConfiguration')
    , channelSym = Symbol('channel')
    , actualConsumerTagSym = Symbol('actualConsumerTag');

  module.exports = function exportingFunction(amqp) {

    // jscs:disable disallowAnonymousFunctions
    // jscs:disable requireNamedUnassignedFunctions
    class AmpqWorker extends AmpqConnection {

      constructor(amqpConfiguration) {

        super(amqp, amqpConfiguration);
        this[amqpConfigurationSym] = amqpConfiguration;
        this.on('amqp:channel-ready', channel => {

          this[channelSym] = channel;
          channel.prefetch(1);
          channel.assertQueue(amqpConfiguration.queueName, {
            'durable': true
          })
          .then(() => {

            this.emit('amqp:worker-ready', channel);
          });
        });
      }

      receive() {

        const consumeMap = {
            'noAck': false
          }
          , onConsumeFinished = consumePayload => {

            if (consumePayload) {

              this[actualConsumerTagSym] = consumePayload.consumerTag;
            }
          };

        return new global.Promise(resolve => {
          let manageMessage = message => {

            resolve(message);
            this[channelSym].ack(message);
          };

          if (this[channelSym]) {

            this[channelSym].consume(this[amqpConfigurationSym].queueName, manageMessage, consumeMap).then(onConsumeFinished);
          } else {

            this.on('amqp:worker-ready', channel => {

              channel.consume(this[amqpConfigurationSym].queueName, manageMessage, consumeMap).then(onConsumeFinished);
            });
          }
        });
      }

      cancelConsumer() {

        if (this[channelSym]) {

          if (this[actualConsumerTagSym]) {

            this[channelSym].cancel(this[actualConsumerTagSym]);
          }
        } else {

          this.on('amqp:worker-ready', channel => {

            if (this[actualConsumerTagSym]) {

              channel.cancel(this[actualConsumerTagSym]);
            }
          });
        }
      }
    }
    // jscs:enable disallowAnonymousFunctions
    // jscs:enable requireNamedUnassignedFunctions

    return AmpqWorker;
  };
}(global, require, module));
