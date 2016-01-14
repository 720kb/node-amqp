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
    , Subscriber = nodeAmqp.Subscriber;

  // jscs:disable disallowAnonymousFunctions
  // jscs:disable requireNamedUnassignedFunctions
  class MySubscriber extends Subscriber {

    constructor() {
      super(testingConfigurations);
    }

    onMessage() {
    }
  }
  // jscs:enable disallowAnonymousFunctions
  // jscs:enable requireNamedUnassignedFunctions

  describe('node-amqp subscriber is correctly instantiated', () => {
    let subscriberMethods;

    before(done => {

      subscriberMethods = Object.getOwnPropertyNames(Subscriber.prototype);
      done();
    });

    it('should Subscriber class must have declared methods', done => {

      expect(subscriberMethods).to.only.include([
        'constructor'
      ]);
      done();
    });

    it('should not instantiate subscriber directly (it\'s an abstract class)', done => {
      let subscriber;

      try {
        subscriber = new Subscriber(testingConfigurations);

        expect(subscriber).to.be.undefined();
      } catch (e) {

        expect(e).to.be.an.instanceof(Error);
      } finally {

        if (subscriber) {

          subscriber.closeConnection();
        }
        done();
      }
    });

    it('should instantiate subscriber sub class', done => {
      let mySubscriber = new MySubscriber();

      expect(mySubscriber).to.not.be.undefined();
      expect(mySubscriber).to.be.an.object();
      expect(mySubscriber).to.be.an.instanceof(Subscriber);

      subscriberMethods.forEach((anElement) => {

        expect(mySubscriber[anElement]).to.be.a.function();
      });

      expect(mySubscriber.onMessage).to.be.a.function();

      mySubscriber.closeConnection();
      done();
    });
  });

  module.exports = {
    'lab': lab
  };
}(module, require));
