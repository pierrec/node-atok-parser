/*
 * Emitted events tests
**/
var assert = require('assert')

var EV = require('..')
var options = { match: 2 }

describe('#emit()', function () {
  describe('shortcut', function () {
    var ev = new EV(options)

    it('emit_match', function (done) {
      assert.deepEqual(typeof ev.emit_match, 'function')
      done()
    })
  })

  describe('emit("match")', function () {
    it('should trigger the handler with its arguments', function (done) {
      var ev = new EV(options)
      
      function handler (a, b) {
        assert.equal(a, 'a')
        assert.equal(b, 'b')
        done()
      }
      ev.on('match', handler)
      ev.emit('match', 'a', 'b')
    })

    it('should trigger the handler with its arguments', function (done) {
      var ev = new EV(options)
      
      function handler (a, b, c, d) {
        assert.equal(a, 'a')
        assert.equal(b, 'b')
        assert.equal(c, 'c')
        assert.equal(d, 'd')
        done()
      }
      ev.on('match', handler)
      ev.emit('match', 'a', 'b', 'c', 'd')
    })
  })

  describe('emit_match', function () {
    it('should emit trigger the handler with its arguments', function (done) {
      var ev = new EV(options)

      function handler (a, b) {
        assert.equal(a, 'a')
        assert.equal(b, 'b')
        done()
      }
      ev.on('match', handler)
      ev.emit_match('a', 'b')
    })
    
    it('should emit trigger the handler with its arguments', function (done) {
      var ev = new EV(options)
      
      function handler (a, b, c, d) {
        assert.equal(a, 'a')
        assert.equal(b, 'b')
        assert.equal(c, 'c')
        assert.equal(d, 'd')
        done()
      }
      ev.on('match', handler)
      ev.emit_match('a', 'b', 'c', 'd')
    })
  })

  describe('arguments', function () {
    var ev = new EV(options)
    var args = []

    it('should emit trigger the handler with all its arguments', function (done) {
      function handler () {
        args.push(arguments.length)
      }
      ev.on('match', handler)
      ev.emit_match()
      ev.emit_match(null)
      ev.emit_match(null, null)
      ev.emit_match(null, null, null)
      ev.emit_match(null, null, null, null)
      ev.emit_match(null, null, null, null, null)
      assert.deepEqual(args, [0, 1, 2, 3, 4, 5])
      done()
    })
  })

  describe('emitter changed while emitting', function () {
    var ev = new EV(options)
    var callbacks_called = []

    function callback1 () {
      callbacks_called.push('callback1')
      ev.on('match', callback2)
      ev.on('match', callback3)
      ev.off('match', callback1)
    }

    function callback2 () {
      callbacks_called.push('callback2')
      ev.off('match', callback2)
    }

    function callback3 () {
      callbacks_called.push('callback3')
      ev.off('match', callback3)
    }

    it('should maintain its listeners', function (done) {
      ev.on('match', callback1)
      // Make sure callback1 is there
      assert.equal(1, ev.listeners('match').length)

      // Make sure callback2 and callback3 are there and callback1 got called
      ev.emit_match()
      assert.equal(2, ev.listeners('match').length)
      assert.deepEqual( ['callback1'], callbacks_called)
      
      // Make sure all callbacks got called and no more listeners attached
      ev.emit_match()
      assert.equal(0, ev.listeners('match').length)
      assert.deepEqual( ['callback1','callback2','callback3'], callbacks_called)

      // Nothing should changed upon new emission
      ev.emit_match()
      assert.equal(0, ev.listeners('match').length)
      assert.deepEqual( ['callback1','callback2','callback3'], callbacks_called)

      done()
    })

    it('should emit to all listeners while removing callbacks', function (done) {
      callbacks_called = []

      // Basic checks
      ev.on('match', callback2)
      ev.on('match', callback3)
      assert.equal(2, ev.listeners('match').length)
      ev.removeAllListeners('match')
      assert.equal(0, ev.listeners('match').length)

      ev.on('match', callback2)
      ev.on('match', callback3)
      ev.emit('match')
      assert.deepEqual( ['callback2', 'callback3'], callbacks_called )
      assert.equal(0, ev.listeners('match').length)

      done()
    })
  })
})