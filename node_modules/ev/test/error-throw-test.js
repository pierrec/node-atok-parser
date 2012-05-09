/*
 * Emitted events tests
**/
var assert = require('assert')

var EV = require('..')
var options = { match: 2 }

describe('Emitting the error event', function () {
  function handler () {}

  describe('with no listener attached', function () {
    var p = new EV()
    it('should throw an Error', function (done) {
      assert.throws(
        function () {
          p.emit_error( new Error('this is a test') )
        }
      , function (err) {
          if (err instanceof Error) return true
        }
      )
      done()
    })
  })

  describe('with a listener attached', function () {
    var p = new EV()
    it('should not throw an Error', function (done) {
      p.on('error', function () {})
      assert.doesNotThrow(
        function () {
          p.emit_error( new Error('this is a test') )
        }
      , function (err) {
          if (err instanceof Error) return true
        }
      )
      done()
    })
  })
})