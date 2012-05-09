/*
 * Emitted events tests
**/
var assert = require('assert')

var EV = require('..')
var options = { match: 2 }

describe('#setMaxListeners()', function () {
  function handler () {}

  describe('default', function () {
    describe('<= 10', function () {
      var ev = new EV(options)

      it('should not warn', function (done) {
        for (var i = 0; i < 10; i++)
          ev.on('match', handler)
        
        assert.equal(ev._ev_maxWarning.match, false)
        done()
      })
    })

    describe('> 10', function () {
      var ev = new EV(options)

      it('should warn', function (done) {
        for (var i = 0; i < 11; i++)
          ev.on('match', handler)
        
        assert.equal(ev._ev_maxWarning.match, true)
        done()
      })
    })
  })

  describe('5', function () {
    describe('<= 5', function () {
      var ev = new EV(options)
      ev.setMaxListeners(5)

      it('should not warn', function (done) {
        for (var i = 0; i < 5; i++)
          ev.on('match', handler)
        
        assert.equal(ev._ev_maxWarning.match, false)
        done()
      })
    })

    describe('> 5', function () {
      var ev = new EV(options)
      ev.setMaxListeners(5)

      it('should warn', function (done) {
        for (var i = 0; i < 6; i++)
          ev.on('match', handler)
        
        assert.equal(ev._ev_maxWarning.match, true)
        done()
      })
    })
  })

  describe('1', function () {
    describe('<= 1', function () {
      var ev = new EV(options)
      ev.setMaxListeners(1)

      it('should not warn', function (done) {
        for (var i = 0; i < 1; i++)
          ev.on('match', handler)
        
        assert.equal(ev._ev_maxWarning.match, false)
        done()
      })
    })

    describe('> 1', function () {
      var ev = new EV(options)
      ev.setMaxListeners(1)

      it('should warn', function (done) {
        for (var i = 0; i < 2; i++)
          ev.on('match', handler)
        
        assert.equal(ev._ev_maxWarning.match, true)
        done()
      })
    })
  })

  describe('0', function () {
    var ev = new EV(options)
    ev.setMaxListeners(0)

    it('should not warn', function (done) {
      for (var i = 0; i < 1000; i++)
        ev.on('match', handler)
      
      assert.equal(ev._ev_maxWarning.match, false)
      done()
    })
  })
})