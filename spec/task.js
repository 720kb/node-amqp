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
    , Task = nodeAmqp.Task;

  describe('node-amqp task is correctly instantiated', () => {
    let taskMethods;

    before(done => {

      taskMethods = Object.getOwnPropertyNames(Task.prototype);
      done();
    });

    it('should Task class must have declared methods', done => {

      expect(taskMethods).to.only.include([
        'constructor',
        'send']);
      done();
    });

    it('should instantiate Task', done => {
      const task = new Task(testingConfigurations);

      expect(task).to.not.be.undefined();
      expect(task).to.be.an.object();
      expect(task).to.be.an.instanceof(Task);

      taskMethods.forEach((anElement) => {

        expect(task[anElement]).to.be.a.function();
      });

      task.closeConnection();
      done();
    });
  });

  module.exports = {
    'lab': lab
  };
}(module, require));
