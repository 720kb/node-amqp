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
    , Task = nodeAmqp.Task
    , Worker = nodeAmqp.Worker
    , exchangedMessage = JSON.stringify({
      'message': 'hello'
    })
    , secondExchangedMessage = JSON.stringify({
      'message': 'world'
    });

  describe('node-amqp task talks to worker', () => {
    let task
      , worker
      , taskFinished = false
      , workerFinished = false;

    before(done => {

      task = new Task(testingConfigurations);
      worker = new Worker(testingConfigurations);

      task.on('amqp:task-ready', () => {

        if (!taskFinished) {

          taskFinished = true;
        }

        if (workerFinished &&
          taskFinished) {

          done();
        }
      });

      worker.on('amqp:worker-ready', () => {

        if (!workerFinished) {

          workerFinished = true;
        }

        if (workerFinished &&
          taskFinished) {

          done();
        }
      });
    });

    after(done => {

      task.on('amqp:connection-closed', () => {

        if (taskFinished) {

          taskFinished = false;
        }

        if (!workerFinished &&
          !taskFinished) {

          done();
        }
      });

      worker.on('amqp:connection-closed', () => {

        if (workerFinished) {

          workerFinished = false;
        }

        if (!workerFinished &&
          !taskFinished) {

          done();
        }
      });

      task.closeConnection();
      worker.closeConnection();
    });

    it('should publish a message and manage this after while', done => {

      task.send(exchangedMessage);

      global.setTimeout(() => {

        worker.receive().then((message) => {
          let messageArrived = message.content.toString();

          expect(messageArrived).to.be.equal(exchangedMessage);
          worker.cancelConsumer();
          done();
        });
      });
    });

    it('should publish a message and resend this after while', done => {

      task.send(secondExchangedMessage);

      global.setTimeout(() => {

        worker.receive().then((message) => {
          console.info('AA');
          let messageArrived = message.content.toString();

          expect(messageArrived).to.be.equal(secondExchangedMessage);
          worker.send(messageArrived);
          worker.cancelConsumer();
          done();
        });
      });
    });
  });

  module.exports = {
    'lab': lab
  };
}(module, require, global));
