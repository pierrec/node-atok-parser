/*
 * Emitted events tests
**/
var assert = require('assert')

var EV = require('..')
var options = { match: 2 }

describe('listeners scope', function () {
  describe('with 1 listener', function () {
    var ev = new EV(options)

    it('should be set properly', function (done) {
      function handler () {
        assert.deepEqual(this, ev)
        done()
      }

      ev.on('match', handler)
      ev.emit('match', 1, 2)
    })
  })
  
  describe('with 2 listeners', function () {
    var ev = new EV(options)

    it('should be set properly', function (done) {
      function handler1 () {
        assert.deepEqual(this, ev)
      }
      function handler2 () {
        assert.deepEqual(this, ev)
        done()
      }

      ev.on('match', handler1)
      ev.on('match', handler2)
      ev.emit('match', 1, 2)
    })
  })

  describe('with >2 listeners', function () {
    var ev = new EV(options)

    it('should be set properly', function (done) {
      function handler1 () {
        assert.deepEqual(this, ev)
      }
      function handler2 () {
        assert.deepEqual(this, ev)
      }
      function handler3 () {
        assert.deepEqual(this, ev)
        done()
      }

      ev.on('match', handler1)
      ev.on('match', handler2)
      ev.on('match', handler3)
      ev.emit('match', 1, 2)
    })
  })
})