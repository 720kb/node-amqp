/*global module,process,require*/
(function withNode(module, process, require) {
  'use strict';

  module.exports = function exportingFunction(amqp, amqpConfiguration) {
    var handleMessage = function handleMessage(message) {

        if (!message) {

          throw new Error('No message in queue');
        }

        messageHandler(JSON.stringify(message.content.toString()));
      };

    if (!messageHandler) {

      throw new Error('You must provide a message handler');
    }

    amqp.connect(amqpConfiguration.host).then(function onConnection(conn) {

      return conn.createChannel().then(function onChannelCreated(ch) {

        ch.assertExchange(amqpConfiguration.exchangeName, 'fanout', {
          'durable': false
        }).then(function makeAQueue() {

          return ch.assertQueue('', {
            'exclusive': true
          });
        }).then(function bindQueue(qok) {

          return ch.bindQueue(qok.queue, amqpConfiguration.exchangeName, '').then(function onBounded() {

            return qok.queue;
          });
        }).then(function onMessageInQueue(queue) {

          return ch.consume(queue, handleMessage, {
            'noAck': true
          });
        }).then(function onQueueReady() {

          console.info('AMPQ ready...');
        });
      });
    });
  };
}(module, process, require));
