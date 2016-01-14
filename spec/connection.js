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
    , amqp = require('amqplib')
    , Connection = require('../lib/connection');

  describe('node-amqp connection is correctly instantiated', () => {
    let taskMethods;

    before(done => {

      taskMethods = Object.getOwnPropertyNames(Connection.prototype);
      done();
    });

    it('should Connection class must have declared methods', done => {

      expect(taskMethods).to.only.include([
        'constructor',
        'closeConnection',
        'closeChannel']);
      done();
    });

    it('should instantiate Connection', done => {
      const connection = new Connection(amqp, testingConfigurations);

      expect(connection).to.not.be.undefined();
      expect(connection).to.be.an.object();
      expect(connection).to.be.an.instanceof(Connection);

      taskMethods.forEach((anElement) => {

        expect(connection[anElement]).to.be.a.function();
      });

      connection.closeConnection();
      done();
    });

    it('should instantiate Connection and close connection', done => {
      const connection = new Connection(amqp, testingConfigurations);

      connection.on('amqp:connection-closed', () => {

        done();
      });
      connection.closeConnection();
    });

    it('should instantiate Connection and close channel', done => {
      const connection = new Connection(amqp, testingConfigurations);

      connection.on('amqp:channel-close', () => {

        connection.closeConnection();
        done();
      });
      connection.closeChannel();
    });

  });

  module.exports = {
    'lab': lab
  };
}(module, require));
