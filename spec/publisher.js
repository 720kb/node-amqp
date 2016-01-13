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
    , Publisher = nodeAmqp.Publisher;

  describe('node-amqp publisher is correctly instantiated', () => {
    let publisherMethods;

    before(done => {

      publisherMethods = Object.getOwnPropertyNames(Publisher.prototype);
      done();
    });

    it('should Publisher class must have declared methods', done => {

      expect(publisherMethods).to.only.include([
        'constructor',
        'send']);
      done();
    });

    it('should instantiate Publisher', done => {
      const publisher = new Publisher(testingConfigurations);

      expect(publisher).to.not.be.undefined();
      expect(publisher).to.be.an.object();
      expect(publisher).to.be.an.instanceof(Publisher);

      publisherMethods.forEach((anElement) => {

        expect(publisher[anElement]).to.be.a.function();
      });

      done();
    });
  });

  module.exports = {
    'lab': lab
  };
}(module, require));
