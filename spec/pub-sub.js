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
    , Subscriber = nodeAmqp.Subscriber;

  // jscs:disable disallowAnonymousFunctions
  // jscs:disable requireNamedUnassignedFunctions
  class MySubscriber extends Subscriber {

    constructor() {
      super(testingConfigurations);
    }

    onMessage(message) {

      console.info('AAAAAA!');
      console.info(message.content.toString());
    }
  }
  // jscs:enable disallowAnonymousFunctions
  // jscs:enable requireNamedUnassignedFunctions

  describe('node-amqp publisher talks to subscriber', () => {
    let subscriber
      , publisher;

    before(done => {

      subscriber = new MySubscriber();
      publisher = new Publisher(testingConfigurations);
      done();
    });

    it('should publish a message and recieve', done => {

      publisher.send({
        'message': 'hello'
      });
      setTimeout(() => {

        done();
      }, 5000);
    });
  });

  module.exports = {
    'lab': lab
  };
}(module, require));
