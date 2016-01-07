/*global global,require,module*/
(function withNode(global, require, module) {
  'use strict';

  const EventEmitter = require('events')
    , amqpConfigurationSym = Symbol('amqpConfiguration')
    , channelSym = Symbol('channel');

  module.exports = function exportingFunction(amqp) {

    if (!amqp) {

      throw new Error('amqp driver is invalid');
    }

    // jscs:disable disallowAnonymousFunctions
    // jscs:disable requireNamedUnassignedFunctions
    class AmpqWorker extends EventEmitter {

      constructor(amqpConfiguration) {
        if (!amqpConfiguration) {

          throw new Error('Amqp configurations are invalid');
        }
        super();

        this[amqpConfigurationSym] = amqpConfiguration;
        amqp.connect(amqpConfiguration.host, amqpConfiguration.socketOptions)
        .then(connection => {

          this.on('amqp:close-connection', () => {

            connection.close();
          });

          connection.on('close', () => {

            this.emit('amqp:closed');
          });

          connection.on('blocked', () => {

            this.emit('amqp:blocked');
          });

          connection.on('unblocked', () => {

            this.emit('amqp:unblocked');
          });

          return connection.createChannel();
        })
        .then(channel => {

          return channel.assertQueue(amqpConfiguration.exchangeName, {
            'durable': true
          })
          .then(() => {

            this[channelSym] = channel;
            channel.prefetch(1);
            return channel;
          });
        })
        .then(channel => {

          this.emit('amqp:worker-ready', channel);
        });
      }

      receive() {

        return new global.Promise((resolve) => {

          if (this[channelSym]) {

            this[channelSym].consume(this[amqpConfigurationSym].exchangeName, message => {

              resolve(message);
              this[channelSym].ack(message);
            }, {
              'noAck': false
            });
          } else {

            this.on('amqp:worker-ready', (channel) => {

              channel.consume(this[amqpConfigurationSym].exchangeName, message => {

                resolve(message);
                channel.ack(message);
              }, {
                'noAck': false
              });
            });
          }
        });
      }

      closeConnection() {

        this.emit('amqp:close-connection');
      }

      close() {

        this[channelSym].close();
      }
    }
    // jscs:enable disallowAnonymousFunctions
    // jscs:enable requireNamedUnassignedFunctions

    return AmpqWorker;
  };
}(global, require, module));
