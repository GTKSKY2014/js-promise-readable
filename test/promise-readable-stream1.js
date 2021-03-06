'use strict'

const t = require('tap')
require('tap-given')(t)

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

Feature('Test promise-readable module with stream1 API', () => {
  const PromiseReadable = require('../lib/promise-readable').PromiseReadable
  const EventEmitter = require('events').EventEmitter

  class MockStream extends EventEmitter {
    constructor () {
      super()
      this.paused = false
      this.readable = true
    }
    close () { this.closed = true }
    destroy () { this.destroyed = true }
    pause () { this.paused = true }
    resume () { this.paused = false }
  }

  Scenario('Read chunks from stream', () => {
    let promise
    let promiseReadable
    let stream

    Given('Readable object', () => {
      stream = new MockStream()
    })

    And('PromiseReadable object', () => {
      promiseReadable = new PromiseReadable(stream)
    })

    When('I call read method', () => {
      promise = promiseReadable.read()
    })

    And('data event is emitted', () => {
      stream.emit('data', Buffer.from('chunk1'))
    })

    Then('promise returns chunk', () => {
      return promise.should.eventually.deep.equal(Buffer.from('chunk1'))
    })

    When('I call read method again', () => {
      promise = promiseReadable.read()
    })

    And('another data event is emitted', () => {
      stream.emit('data', Buffer.from('chunk2'))
    })

    Then('promise returns another chunk', () => {
      return promise.should.eventually.deep.equal(Buffer.from('chunk2'))
    })
  })

  Scenario('Read empty stream', () => {
    let promise
    let promiseReadable
    let stream

    Given('Readable object', () => {
      stream = new MockStream()
    })

    And('PromiseReadable object', () => {
      promiseReadable = new PromiseReadable(stream)
    })

    When('I call read method', () => {
      promise = promiseReadable.read()
    })

    And('close event is emitted', () => {
      stream.emit('end')
    })

    Then('promise returns undefined value', () => {
      return promise.should.eventually.to.be.undefined
    })
  })

  Scenario('Read closed stream', () => {
    let promise
    let promiseReadable
    let stream

    Given('Readable object', () => {
      stream = new MockStream()
    })

    And('PromiseReadable object', () => {
      promiseReadable = new PromiseReadable(stream)
    })

    When('stream is closed', () => {
      stream.close()
    })

    And('I call read method', () => {
      promise = promiseReadable.read()
    })

    Then('promise returns undefined value', () => {
      return promise.should.eventually.to.be.undefined
    })
  })

  Scenario('Read destroyed stream', () => {
    let promise
    let promiseReadable
    let stream

    Given('Readable object', () => {
      stream = new MockStream()
    })

    And('PromiseReadable object', () => {
      promiseReadable = new PromiseReadable(stream)
    })

    When('stream is closed', () => {
      stream.destroy()
    })

    And('I call read method', () => {
      promise = promiseReadable.read()
    })

    Then('promise returns undefined value', () => {
      return promise.should.eventually.to.be.undefined
    })
  })

  Scenario('Read stream with error', () => {
    let promise
    let promiseReadable
    let stream

    Given('Readable object', () => {
      stream = new MockStream()
    })

    And('PromiseReadable object', () => {
      promiseReadable = new PromiseReadable(stream)
    })

    When('I call read method', () => {
      promise = promiseReadable.read()
    })

    And('error event is emitted', () => {
      stream.emit('error', new Error('boom'))
    })

    Then('promise is rejected', () => {
      return promise.should.be.rejectedWith(Error, 'boom')
    })
  })

  Scenario('Read all from stream', () => {
    let promise
    let promiseReadable
    let stream

    Given('Readable object', () => {
      stream = new MockStream()
    })

    And('PromiseReadable object', () => {
      promiseReadable = new PromiseReadable(stream)
    })

    When('I call readAll method', () => {
      promise = promiseReadable.readAll()
    })

    And('data event is emitted', () => {
      if (!stream.paused) {
        stream.emit('data', Buffer.from('chunk1'))
      }
    })

    And('another data event is emitted', () => {
      if (!stream.paused) {
        stream.emit('data', Buffer.from('chunk2'))
      }
    })

    And('close event is emitted', () => {
      stream.emit('end')
    })

    Then('promise returns all chunks in one buffer', () => {
      return promise.should.eventually.deep.equal(Buffer.from('chunk1chunk2'))
    })
  })

  Scenario('Read all from paused stream', () => {
    let promise
    let promiseReadable
    let stream

    Given('Readable object', () => {
      stream = new MockStream()
    })

    And('PromiseReadable object', () => {
      promiseReadable = new PromiseReadable(stream)
    })

    When('I pause stream', () => {
      stream.pause()
    })

    And('I call readAll method', () => {
      promise = promiseReadable.readAll()
    })

    And('data event is emitted', () => {
      if (!stream.paused) {
        stream.emit('data', Buffer.from('chunk1'))
      }
    })

    And('another data event is emitted', () => {
      if (!stream.paused) {
        stream.emit('data', Buffer.from('chunk2'))
      }
    })

    And('close event is emitted', () => {
      stream.emit('end')
    })

    Then('promise returns all chunks in one buffer', () => {
      return promise.should.eventually.deep.equal(Buffer.from('chunk1chunk2'))
    })
  })

  Scenario('Read all from closed stream', () => {
    let promise
    let promiseReadable
    let stream

    Given('Readable object', () => {
      stream = new MockStream()
    })

    And('PromiseReadable object', () => {
      promiseReadable = new PromiseReadable(stream)
    })

    When('stream is closed', () => {
      stream.close()
    })

    And('I call readAll method', () => {
      promise = promiseReadable.readAll()
    })

    Then('promise returns undefined value', () => {
      return promise.should.eventually.to.be.undefined
    })
  })

  Scenario('Read all from destroyed stream', () => {
    let promise
    let promiseReadable
    let stream

    Given('Readable object', () => {
      stream = new MockStream()
    })

    And('PromiseReadable object', () => {
      promiseReadable = new PromiseReadable(stream)
    })

    When('stream is destroyed', () => {
      stream.destroy()
    })

    And('I call readAll method', () => {
      promise = promiseReadable.readAll()
    })

    Then('promise returns undefined value', () => {
      return promise.should.eventually.to.be.undefined
    })
  })

  Scenario('Read all from stream with error', () => {
    let promise
    let promiseReadable
    let stream

    Given('Readable object', () => {
      stream = new MockStream()
    })

    Given('PromiseReadable object', () => {
      promiseReadable = new PromiseReadable(stream)
    })

    When('I call readAll method', () => {
      promise = promiseReadable.readAll()
    })

    And('data event is emitted', () => {
      stream.emit('data', Buffer.from('chunk1'))
    })

    And('error event is emitted', () => {
      stream.emit('error', new Error('boom'))
    })

    Then('promise is rejected', () => {
      return promise.should.be.rejectedWith(Error, 'boom')
    })
  })

  Scenario('Wait for open from stream', () => {
    let promise
    let promiseReadable
    let stream

    Given('Readable object', () => {
      stream = new MockStream()
    })

    And('PromiseReadable object', () => {
      promiseReadable = new PromiseReadable(stream)
    })

    When('I call open method', () => {
      promise = promiseReadable.once('open')
    })

    And('open event is emitted', () => {
      stream.emit('open', 42)
    })

    Then('promise returns result with fd argument', () => {
      return promise.should.eventually.equal(42)
    })
  })

  Scenario('Wait for open from closed stream', () => {
    let promise
    let promiseReadable
    let stream

    Given('Readable object', () => {
      stream = new MockStream()
    })

    And('PromiseReadable object', () => {
      promiseReadable = new PromiseReadable(stream)
    })

    When('stream is closed', () => {
      stream.close()
    })

    And('I call open method', () => {
      promise = promiseReadable.once('open')
    })

    Then('promise returns undefined value', () => {
      return promise.should.rejectedWith(Error, 'once open after close')
    })
  })

  Scenario('Wait for open from destroyed stream', () => {
    let promise
    let promiseReadable
    let stream

    Given('Readable object', () => {
      stream = new MockStream()
    })

    And('PromiseReadable object', () => {
      promiseReadable = new PromiseReadable(stream)
    })

    When('stream is destroyed', () => {
      stream.destroy()
    })

    And('I call open method', () => {
      promise = promiseReadable.once('open')
    })

    Then('promise returns undefined value', () => {
      return promise.should.rejectedWith(Error, 'once open after destroy')
    })
  })

  Scenario('Wait for open from stream with error', () => {
    let promise
    let promiseReadable
    let stream

    Given('Readable object', () => {
      stream = new MockStream()
    })

    And('PromiseReadable object', () => {
      promiseReadable = new PromiseReadable(stream)
    })

    When('I call open method', () => {
      promise = promiseReadable.once('open')
    })

    And('error event is emitted', () => {
      stream.emit('error', new Error('boom'))
    })

    Then('promise is rejected', () => {
      return promise.should.be.rejectedWith(Error, 'boom')
    })
  })

  Scenario('Wait for close from stream', () => {
    let promise
    let promiseReadable
    let stream

    Given('Readable object', () => {
      stream = new MockStream()
    })

    Given('PromiseReadable object', () => {
      promiseReadable = new PromiseReadable(stream)
    })

    When('I call close method', () => {
      promise = promiseReadable.once('close')
    })

    When('close event is emitted', () => {
      stream.emit('close')
    })

    Then('promise returns result with fd argument', () => {
      return promise.should.eventually.be.undefined
    })
  })

  Scenario('Wait for close from stream with error', () => {
    let promise
    let promiseReadable
    let stream

    Given('Readable object', () => {
      stream = new MockStream()
    })

    And('PromiseReadable object', () => {
      promiseReadable = new PromiseReadable(stream)
    })

    When('I call end method', () => {
      promise = promiseReadable.once('close')
    })

    And('error event is emitted', () => {
      stream.emit('error', new Error('boom'))
    })

    Then('promise is rejected', () => {
      return promise.should.be.rejectedWith(Error, 'boom')
    })
  })

  Scenario('Wait for end from stream', () => {
    let promise
    let promiseReadable
    let stream

    Given('Readable object', () => {
      stream = new MockStream()
    })

    And('PromiseReadable object', () => {
      promiseReadable = new PromiseReadable(stream)
    })

    When('I call end method', () => {
      promise = promiseReadable.once('end')
    })

    And('data event is emitted', () => {
      stream.emit('data', Buffer.from('chunk1'))
    })

    And('another data event is emitted', () => {
      stream.emit('data', Buffer.from('chunk2'))
    })

    And('close event is emitted', () => {
      stream.emit('end')
    })

    Then('promise returns no result', () => {
      return promise.should.eventually.be.undefined
    })
  })

  Scenario('Wait for end from stream with error', () => {
    let promise
    let promiseReadable
    let stream

    Given('Readable object', () => {
      stream = new MockStream()
    })

    And('PromiseReadable object', () => {
      promiseReadable = new PromiseReadable(stream)
    })

    When('I call end method', () => {
      promise = promiseReadable.once('end')
    })

    And('data event is emitted', () => {
      stream.emit('data', Buffer.from('chunk1'))
    })

    And('error event is emitted', () => {
      stream.emit('error', new Error('boom'))
    })

    Then('promise is rejected', () => {
      return promise.should.be.rejectedWith(Error, 'boom')
    })
  })

  Scenario('Wait for error from stream without error', () => {
    let promise
    let promiseReadable
    let stream

    Given('Readable object', () => {
      stream = new MockStream()
    })

    And('PromiseReadable object', () => {
      promiseReadable = new PromiseReadable(stream)
    })

    When('I call end method', () => {
      promise = promiseReadable.once('error')
    })

    And('data event is emitted', () => {
      stream.emit('data', Buffer.from('chunk1'))
    })

    And('another data event is emitted', () => {
      stream.emit('data', Buffer.from('chunk2'))
    })

    And('close event is emitted', () => {
      stream.emit('end')
    })

    Then('promise returns no result', () => {
      return promise.should.eventually.be.undefined
    })
  })

  Scenario('Wait for error from stream with error', () => {
    let promise
    let promiseReadable
    let stream

    Given('Readable object', () => {
      stream = new MockStream()
    })

    And('PromiseReadable object', () => {
      promiseReadable = new PromiseReadable(stream)
    })

    When('I call end method', () => {
      promise = promiseReadable.once('error')
    })

    And('data event is emitted', () => {
      stream.emit('data', Buffer.from('chunk1'))
    })

    And('error event is emitted', () => {
      stream.emit('error', new Error('boom'))
    })

    Then('promise is rejected', () => {
      return promise.should.be.rejectedWith(Error, 'boom')
    })
  })

  Scenario('Read non-Readable stream', () => {
    let promise
    let promiseReadable
    let stream

    Given('Non-Readable object', () => {
      stream = new MockStream()
      stream.readable = false
    })

    And('PromiseReadable object', () => {
      promiseReadable = new PromiseReadable(stream)
    })

    When('I call read method', () => {
      promise = promiseReadable.read()
    })

    And('data event is emitted', () => {
      stream.emit('data', Buffer.from('chunk1'))
    })

    Then('promise returns undefined value', () => {
      return promise.should.eventually.to.be.undefined
    })
  })
})
