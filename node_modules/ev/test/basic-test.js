/*
 * Emitted events tests
**/
var assert = require('assert')

var EV = require('..')
var options = { match: 2 }

describe('dedupListener property', function () {
  describe('if not set', function () {
    var ev = new EV(options)
    var count = 0

    function handler () {
      count++
    }

    it('should not apply', function (done) {
      ev.on('match', handler)
      ev.on('match', handler)
      ev.emit_match()
      assert.equal(count, 2)
      done()
    })
  })

  describe('if set', function () {
    var ev = new EV(options)
    var count = 0

    function handler () {
      count++
    }

    it('should apply', function (done) {
      ev.ev_dedupListener = true
      ev.on('match', handler)
      ev.on('match', handler)
      ev.emit_match()
      assert.equal(count, 1)
      done()
    })
  })
})