/*
 * Emitted events tests
**/
var assert = require('assert')

var EV = require('..')
var options = { match: 2 }

describe('#removeListener()', function () {
  function handler1 () {}
  function handler2 () {}

  describe('alias', function () {
    it('removeListener === off', function (done) {
      assert.deepEqual(EV.removeListener, EV.off)
      done()
    })
  })

  describe('removing the only listener', function () {
    var ev = new EV(options)

    it('should remove the listener', function (done) {
      ev.on('match', handler1)
      ev.off('match', handler1)
      assert.deepEqual( [], ev.listeners('match') )
      done()
    })
  })

  describe('removing a non existing listener', function () {
    var ev = new EV(options)

    it('should not remove existing listeners', function (done) {
      ev.on('match', handler1)
      ev.off('match', handler2)
      assert.deepEqual( [handler1], ev.listeners('match') )
      done()
    })
  })

  describe('removing an existing listener', function () {
    var ev = new EV(options)

    it('should not remove other listeners', function (done) {
      ev.on('match', handler1)
      ev.on('match', handler2)
      ev.off('match', handler2)
      assert.deepEqual( [handler1], ev.listeners('match') )
      done()
    })
  })

  describe('removing an existing listener', function () {
    var ev = new EV(options)

    it('should emit oldListener', function (done) {
      ev.on('oldListener', function (ev, listener) {
        assert.equal(ev, 'match')
        assert.deepEqual(listener, handler1)
        done()
      })
      ev.on('match', handler1)
      ev.off('match', handler1)
    })
  })
})