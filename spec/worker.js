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
    , Worker = nodeAmqp.Worker;

  describe('node-amqp worker is correctly instantiated', () => {
    let workerMethods;

    before(done => {

      workerMethods = Object.getOwnPropertyNames(Worker.prototype);
      done();
    });

    it('should Worker class must have declared methods', done => {

      expect(workerMethods).to.only.include([
        'constructor',
        'receive',
        'consume',
        'send',
        'cancelConsumer']);
      done();
    });

    it('should instantiate Worker', done => {
      const worker = new Worker(testingConfigurations);

      expect(worker).to.not.be.undefined();
      expect(worker).to.be.an.object();
      expect(worker).to.be.an.instanceof(Worker);

      workerMethods.forEach((anElement) => {

        expect(worker[anElement]).to.be.a.function();
      });

      worker.closeConnection();
      done();
    });
  });

  module.exports = {
    'lab': lab
  };
}(module, require));
