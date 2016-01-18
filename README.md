node-amqp
==========
Wrapper around the [`amqplib`](https://github.com/squaremo/amqp.node) node library.

The main goal of this module is to hide the actual procedures needed to establish a amqp connection instantiating objects.

node-amqp is developed by [720kb](720kb.net).

## Requirements
Node.js v5.0.0+

## Installation

This module can be installed via npm issuing:
```
$ npm install node-amqp --save
```
in your project folder.

## Usage
At this moment, the module expose four objects that manage two kind of interactions between actors:
 - Publish/Subscribe;
 - Work queue.

The first configuration is achieved with the `Publisher` and `Subscriber` objects; the second is achieved with `Task` and `Worker` objects.

All these notify theirs connections state with events, at the moment the only usable are:
 - `amqp:ready`: emitted when the amqp connection and client channel are correctly instantiated and configured;
 - `amqp:connection-closed`: emitted when the amqp connection is closed;
 - `amqp:channel-close`: emitted when the client channel opened upon the amqp connection is closed.

## Examples
Here are short usage examples:

#### Publish/Subscribe
```js
//Publish
const nodeAmqp = require('node-amqp')
  , Publisher = nodeAmqp.Publisher
  , publisher = new Publisher({
    'host': '<amqp host>', //e.g. amqp://localhost
    'exchangeName': '<exchange where publish the messages>', //e.g. node-amqp:exchange-test
    'socketOptions': {} // socket options used for example to configure ssl. Reference for this can be found at http://www.squaremobius.net/amqp.node/channel_api.html#connect
  });

  publisher.send('a message!'); //objects must be serialized, for example in JSON
```

```js
//Publish
const nodeAmqp = require('node-amqp')
  , Subscriber = nodeAmqp.Subscriber;

class MySubscriber extends Subscriber {

  constructor() {
    super({
      'host': '<amqp host>', //e.g. amqp://localhost
      'exchangeName': '<exchange where published messages are>', //e.g. node-amqp:exchange-test
      'socketOptions': {} // socket options used for example to configure ssl. Reference for this can be found at http://www.squaremobius.net/amqp.node/channel_api.html#connect
    });
  }

  onMessage(message) {
    let messageArrived = message.content.toString();

    console.info(`${messageArrived} published!`);
  }
}
const subscriber = new MySubscriber();
```

#### Work queue
```js
//Producer
const nodeAmqp = require('node-amqp')
  , Task = nodeAmqp.Task
  , task = new Task({
    'host': '<amqp host>', //e.g. amqp://localhost
    'queueName': '<queue where put the messages>', //e.g. node-amqp:queue-test
    'socketOptions': {} // socket options used for example to configure ssl. Reference for this can be found at http://www.squaremobius.net/amqp.node/channel_api.html#connect
  });

task.send('a message!'); //objects must be serialized, for example in JSON
```

```js
//Consumer
const nodeAmqp = require('node-amqp')
  , Worker = nodeAmqp.Worker
  , worker = new Worker({
    'host': '<amqp host>', //e.g. amqp://localhost
    'queueName': '<queue where get the messages>', //e.g. node-amqp:queue-test
    'socketOptions': {} // socket options used for example to configure ssl. Reference for this can be found at http://www.squaremobius.net/amqp.node/channel_api.html#connect
  });

//1st approach register a consumer:
worker.consume()
.then(message => {
  worker.cancelConsumer(); //if you want to cancel the consumer call this method.
  let messageArrived = message.content.toString();

  console.info(`${messageArrived} arrived from producer`);
})
.catch(err => {

  throw new Error(err);
});

//2nd approach query for a message:
worker.receive()
.then(message => {

  if (message) { //false if there is nothing on queue
    let messageArrived = message.content.toString();

    console.info(`${messageArrived} present in queue`);
  }
})
.catch(err => {

  throw new Error(err);
});

```

## Contributing

We will be much grateful if you help us making this project to grow up.
Feel free to contribute by forking, opening issues, pull requests etc.

## License
The MIT License (MIT)

Copyright (c) 2015 Dario Andrei

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
