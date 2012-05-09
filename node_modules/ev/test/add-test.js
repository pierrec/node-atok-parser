/*
 * Emitted events tests
**/
var assert = require('assert')

var EV = require('..')
var options = { match: 2 }

describe('#add()', function () {
  function handler () {}

  describe('aliases', function () {
    it('addListener === on', function (done) {
      assert.deepEqual(EV.addListener, EV.on)
      done()
    })
    it('addListener === addEventListener', function (done) {
      assert.deepEqual(EV.addListener, EV.addEventListener)
      done()
    })
  })

  describe('[newListener]', function () {
    var ev = new EV(options)
    var count = 0

    it('should emit [newListener] when a listener is added', function (done) {
      ev.on('newListener', function (event, listener) {
        count++
        assert.equal(count, 1)
        assert.equal(event, 'match')
        assert.equal(listener, handler)
        done()
      })
      ev.on('match', handler)
    })
  })
})