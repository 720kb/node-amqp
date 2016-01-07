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
    class AmpqPublish extends EventEmitter {

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

          return channel.assertExchange(amqpConfiguration.exchangeName, 'fanout', {
            'durable': false
          })
          .then(() => {

            this[channelSym] = channel;
            return channel;
          });
        })
        .then(channel => {

          this.emit('amqp:publisher-ready', channel);
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

          this.on('amqp:publisher-ready', (channel) => {

            channel.publish(this[amqpConfigurationSym].exchangeName, '', dataToSend);
          });
        }
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

    return AmpqPublish;
  };
}(global, require, module));
