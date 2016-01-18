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

            this.emit('amqp:ready', channel);
          })
          .catch(err => {

            throw new Error(err);
          });
        });
      }

      receive() {
        let getMap = {
          'noAck': false
        };

        return new Promise(resolve => {

          if (this[channelSym]) {

            this[channelSym].get(this[amqpConfigurationSym].queueName, getMap)
            .then(message => {

              if (message) {

                resolve(message);
                this[channelSym].ack(message);
              } else {

                resolve(false);
              }
            })
            .catch(err => {

              throw new Error(err);
            });
          } else {

            this.on('amqp:ready', channel => {

              channel.get(this[amqpConfigurationSym].queueName, getMap)
              .then(message => {

                if (message) {

                  resolve(message);
                  channel.ack(message);
                } else {

                  resolve(false);
                }
              })
              .catch(err => {

                throw new Error(err);
              });
            });
          }
        });
      }

      consume() {

        const consumeMap = {
            'noAck': false
          }
          , onConsumeFinished = consumePayload => {

            if (consumePayload) {

              this[actualConsumerTagSym] = consumePayload.consumerTag;
            }
          };

        return new global.Promise(resolve => {

          if (this[channelSym]) {

            this[channelSym].consume(this[amqpConfigurationSym].queueName, message => {

              resolve(message);
              this[channelSym].ack(message);
            }, consumeMap)
            .then(onConsumeFinished)
            .catch(err => {

              throw new Error(err);
            });
          } else {

            this.on('amqp:ready', channel => {

              channel.consume(this[amqpConfigurationSym].queueName, message => {

                resolve(message);
                channel.ack(message);
              }, consumeMap)
              .then(onConsumeFinished)
              .catch(err => {

                throw new Error(err);
              });
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

          this.on('amqp:ready', channel => {

            if (this[actualConsumerTagSym]) {

              channel.cancel(this[actualConsumerTagSym]);
            }
          });
        }
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

    return AmpqWorker;
  };
}(global, require, module));
