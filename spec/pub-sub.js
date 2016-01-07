/*global module,require*/
(function testing(module, require) {
  'use strict';

  const code = require('code')
    , lab = require('lab').script()
    , describe = lab.describe
    , it = lab.it
    , before = lab.before
    , expect = code.expect
    , testingConfigurations = require('./test.json')
    , nodeAmqp = require('..')
    , Publisher = nodeAmqp.Publisher
    , Subscriber = nodeAmqp.Subscriber
    , exchangedMessage = JSON.stringify({
      'message': 'hello'
    });

  // jscs:disable disallowAnonymousFunctions
  // jscs:disable requireNamedUnassignedFunctions
  class MySubscriber extends Subscriber {

    constructor() {
      super(testingConfigurations);
    }

    onMessage(message) {

      let messageArrived = message.content.toString();
      expect(messageArrived).to.be.equal(exchangedMessage)
      this.emit('test:finished');
    }
  }
  // jscs:enable disallowAnonymousFunctions
  // jscs:enable requireNamedUnassignedFunctions

  describe('node-amqp publisher talks to subscriber', () => {
    let subscriber
      , publisher
      , subFinished = false
      , pubFinished = false;

    before(done => {

      subscriber = new MySubscriber();
      publisher = new Publisher(testingConfigurations);

      subscriber.on('amqp:subscriber-ready', () => {

        if (!subFinished) {

          subFinished = true;
        }

        if (pubFinished &&
          subFinished) {

          done();
        }
      });

      publisher.on('amqp:publisher-ready', () => {

        if (!pubFinished) {

          pubFinished = true;
        }

        if (pubFinished &&
          subFinished) {

          done();
        }
      });
    });

    it('should publish a message and recieve', done => {

      subscriber.once('test:finished', () => {

        done();
      });
      publisher.send(exchangedMessage);
    });
  });

  module.exports = {
    'lab': lab
  };
}(module, require));
