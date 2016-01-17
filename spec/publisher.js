/*global module,require,global*/
(function testing(module, require, global) {
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
    , Publisher = nodeAmqp.Publisher;

  describe('node-amqp publisher is correctly instantiated', () => {
    let publisher = new Publisher(testingConfigurations)
      , publisherFinished = false
      , publisherMethods = Object.getOwnPropertyNames(Publisher.prototype);

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
      let onTimeoutTrigger = () => {

        if (publisherFinished) {

          done();
        } else {

          global.setTimeout(onTimeoutTrigger, 20);
        }
      };

      onTimeoutTrigger();
    });

    after(done => {

      let onTimeoutTrigger = () => {

        if (publisherFinished) {

          global.setTimeout(onTimeoutTrigger, 20);
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

      publisherMethods.forEach((anElement) => {

        expect(publisher[anElement]).to.be.a.function();
      });

      publisher.closeConnection();
      done();
    });
  });

  module.exports = {
    'lab': lab
  };
}(module, require, global));
