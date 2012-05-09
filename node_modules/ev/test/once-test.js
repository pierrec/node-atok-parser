/*
 * Emitted events tests
**/
var assert = require('assert')

var EV = require('..')
var options = { match: 2 }

describe('#once()', function () {
  describe('with multiple emissions', function () {
    var ev = new EV(options)
    var count = 0

    it('should only trigger once', function (done) {
      ev.once('match', function () {
        count++
      })
      ev.emit_match()
      ev.emit_match()
      ev.emit_match()
      ev.emit_match()
      ev.emit_match()
      assert.equal(count, 1)
      done()
    })
  })

  describe('removed', function () {
    var ev = new EV(options)

    it('should not trigger', function (done) {
      function removed () {
        done( new Error('should not trigger') )
      }
      ev.once('match', removed)
      ev.off('match', removed)
      ev.emit_match()
      done()
    })
  })

  describe('arguments', function () {
    var ev = new EV(options)
    var args = []

    it('should emit trigger the handler with all its arguments', function (done) {
      function handler () {
        args.push(arguments.length)
      }
      ev.once('match', handler)
      ev.emit_match(null, null)
      assert.deepEqual(args, [2])
      done()
    })
  })

  // TODO test once([ev1,ev2], listener)
})