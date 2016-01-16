/*global require,module*/
(function withNode(require, module) {
  'use strict';

  const EventEmitter = require('events')
    , channelSym = Symbol('channel')
    , fromConnectionToChannelSym = Symbol('fromConnectionToChannel')
    , wireUpChannelSym = Symbol('wireUpChannel')
    , manageError = err => {

      throw new Error(err);
    };

  // jscs:disable disallowAnonymousFunctions
  // jscs:disable requireNamedUnassignedFunctions
  class AmpqConnection extends EventEmitter {

    constructor(amqp, amqpConfiguration) {
      if (!amqp) {

        throw new Error('amqp driver is invalid');
      }

      if (!amqpConfiguration) {

        throw new Error('Amqp configurations are invalid');
      }
      super();
      this[fromConnectionToChannelSym] = connection => {

        if (this[channelSym]) {

          throw new Error('Only one channel can be managed');
        }

        return connection.createChannel();
      };
      this[wireUpChannelSym] = channel => {

        channel.on('error', manageError);
        channel.on('close', () => {

          this.emit('amqp:channel-close');
        });

        channel.on('return', message => {

          this.emit('amqp:channel-message-returned', message);
        });

        channel.on('drain', () => {

          this.emit('amqp:channel-drain');
        });

        this[channelSym] = channel;
        this.emit('amqp:channel-ready', channel);
      };

      amqp.connect(amqpConfiguration.host, amqpConfiguration.socketOptions)
      .then(connection => {

        connection.on('error', manageError);
        connection.on('close', () => {

          this.emit('amqp:connection-closed');
        });

        connection.on('blocked', reason => {

          this.emit('amqp:connection-blocked', reason);
        });

        connection.on('unblocked', () => {

          this.emit('amqp:connection-unblocked');
        });

        this.emit('amqp:connection-ready', connection);
        return connection;
      })
      .then(this[fromConnectionToChannelSym])
      .then(this[wireUpChannelSym])
      .catch(manageError);
    }

    closeConnection() {

      if (this[channelSym] &&
      this[channelSym].connection) {

        this[channelSym].connection.close();
        delete this[channelSym];
      } else {

        this.on('amqp:channel-ready', () => {

          this[channelSym].connection.close();
          delete this[channelSym];
        });
      }
    }

    closeChannel() {

      if (this[channelSym]) {

        this[channelSym].close();
        delete this[channelSym];
      } else {

        this.on('amqp:channel-ready', () => {

          this[channelSym].close();
          delete this[channelSym];
        });
      }
    }
  }
  // jscs:enable disallowAnonymousFunctions
  // jscs:enable requireNamedUnassignedFunctions

  module.exports = AmpqConnection;
}(require, module));
