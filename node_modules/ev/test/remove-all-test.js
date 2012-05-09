/*
 * Emitted events tests
**/
var assert = require('assert')

var EV = require('..')
var options = { foo: 2, bar: 3 }

describe('#removeAllListeners()', function () {
  function handler () {}

  describe('for event [foo]', function () {
    var ev = new EV(options)

    it('should only remove the listener for [foo]', function (done) {
      ev.on('foo', handler)
      ev.on('bar', handler)
      ev.removeAllListeners('foo')
      assert.deepEqual( [], ev.listeners('foo') )
      assert.deepEqual( [handler], ev.listeners('bar') )
      done()
    })
  })

  describe('for all events', function () {
    var ev = new EV(options)

    it('should remove all listeners', function (done) {
      ev.on('foo', handler)
      ev.on('bar', handler)
      ev.removeAllListeners()
      assert.deepEqual( [], ev.listeners('foo') )
      assert.deepEqual( [], ev.listeners('bar') )
      done()
    })
  })
})