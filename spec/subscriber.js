/*global module,require,global*/
(function testing() {
  'use strict';

  const code = require('code')
    , lab = require('lab').script()
    , describe = lab.describe
    , it = lab.it
    , before = lab.before
    , after = lab.after
    , expect = code.expect
    , testingConfigurations = require('./test.json')
    , nodeAmqp = require('..')
    , Subscriber = nodeAmqp.Subscriber
    , retryTimeoutMillisec = 20;

  class MySubscriber extends Subscriber {

    constructor() {
      super(testingConfigurations);
    }

    onMessage() {
    }
  }

  describe('node-amqp subscriber is correctly instantiated', () => {
    const mySubscriber = new MySubscriber()
      , subscriberMethods = Object.getOwnPropertyNames(Subscriber.prototype);
    let subscriberFinished = false;

    mySubscriber.on('amqp:ready', () => {

      if (!subscriberFinished) {

        subscriberFinished = true;
      }
    });

    mySubscriber.on('amqp:connection-closed', () => {

      if (subscriberFinished) {

        subscriberFinished = false;
      }
    });

    before(done => {
      const onTimeoutTrigger = () => {

        if (subscriberFinished) {

          done();
        } else {

          global.setTimeout(onTimeoutTrigger, retryTimeoutMillisec);
        }
      };

      onTimeoutTrigger();
    });

    after(done => {
      const onTimeoutTrigger = () => {

        if (subscriberFinished) {

          global.setTimeout(onTimeoutTrigger, retryTimeoutMillisec);
        } else {

          done();
        }
      };

      onTimeoutTrigger();
      mySubscriber.closeConnection();
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
      } catch (err) {

        expect(err).to.be.an.instanceof(Error);
      } finally {

        if (subscriber) {

          subscriber.closeConnection();
        }
        done();
      }
    });

    it('should instantiate subscriber sub class', done => {

      expect(mySubscriber).to.not.be.undefined();
      expect(mySubscriber).to.be.an.object();
      expect(mySubscriber).to.be.an.instanceof(Subscriber);

      subscriberMethods.forEach(anElement => {

        expect(mySubscriber[anElement]).to.be.a.function();
      });

      expect(mySubscriber.onMessage).to.be.a.function();

      mySubscriber.closeConnection();
      done();
    });
  });

  module.exports = {
    lab
  };
}());
