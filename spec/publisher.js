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
    , Publisher = nodeAmqp.Publisher
    , retryTimeoutMillisec = 20;

  describe('node-amqp publisher is correctly instantiated', () => {
    const publisher = new Publisher(testingConfigurations)
      , publisherMethods = Object.getOwnPropertyNames(Publisher.prototype);
    let publisherFinished = false;

    publisher.on('amqp:ready', () => {

      if (!publisherFinished) {

        publisherFinished = true;
      }
    });

    publisher.on('amqp:connection-closed', () => {

      if (publisherFinished) {

        publisherFinished = false;
      }
    });

    before(done => {
      const onTimeoutTrigger = () => {

        if (publisherFinished) {

          done();
        } else {

          global.setTimeout(onTimeoutTrigger, retryTimeoutMillisec);
        }
      };

      onTimeoutTrigger();
    });

    after(done => {
      const onTimeoutTrigger = () => {

        if (publisherFinished) {

          global.setTimeout(onTimeoutTrigger, retryTimeoutMillisec);
        } else {

          done();
        }
      };

      onTimeoutTrigger();
      publisher.closeConnection();
    });

    it('should Publisher class must have declared methods', done => {

      expect(publisherMethods).to.only.include([
        'constructor',
        'send']);
      done();
    });

    it('should instantiate Publisher', done => {

      expect(publisher).to.not.be.undefined();
      expect(publisher).to.be.an.object();
      expect(publisher).to.be.an.instanceof(Publisher);

      publisherMethods.forEach(anElement => {

        expect(publisher[anElement]).to.be.a.function();
      });

      publisher.closeConnection();
      done();
    });
  });

  module.exports = {
    lab
  };
}(module, require, global));
