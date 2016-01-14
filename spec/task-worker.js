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
      'first': 'first'
    })
    , secondExchangedMessage = JSON.stringify({
      'second': 'second'
    })
    , task = new Task(testingConfigurations)
    , worker = new Worker(testingConfigurations);

  let taskFinished = false
    , workerFinished = false;

  task.on('amqp:task-ready', () => {

    if (!taskFinished) {

      taskFinished = true;
    }
  });

  worker.on('amqp:worker-ready', () => {

    if (!workerFinished) {

      workerFinished = true;
    }
  });

  task.on('amqp:connection-closed', () => {

    if (taskFinished) {

      taskFinished = false;
    }
  });

  worker.on('amqp:connection-closed', () => {

    if (workerFinished) {

      workerFinished = false;
    }
  });

  describe('node-amqp task talks to worker', () => {

    before(done => {
      let onTimeoutTrigger = () => {

        if (workerFinished &&
          taskFinished) {

          done();
        } else {

          global.setTimeout(onTimeoutTrigger, 20);
        }
      };

      onTimeoutTrigger();
    });

    after(done => {

      let onTimeoutTrigger = () => {

        if (!workerFinished &&
          !taskFinished) {

          done();
        } else {

          global.setTimeout(onTimeoutTrigger, 20);
        }
      };

      onTimeoutTrigger();
      task.closeConnection();
      worker.closeConnection();
    });

    it('should publish a message and manage this after while', done => {

      worker.receive().then((message) => {
        worker.cancelConsumer();
        let messageArrived = message.content.toString();

        expect(messageArrived).to.be.equal(exchangedMessage);
        done();
      });
      task.send(exchangedMessage);
    });

    it('should publish a message and resend this after while', done => {

      worker.receive().then((message) => {
        worker.cancelConsumer();
        let messageArrived = message.content.toString();

        expect(messageArrived).to.be.equal(secondExchangedMessage);
        worker.send(messageArrived);
        done();
      });
      task.send(secondExchangedMessage);
    });
  });

  module.exports = {
    'lab': lab
  };
}(module, require, global));
