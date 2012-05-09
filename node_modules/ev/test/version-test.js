/*
 * Basic tests
**/
var assert = require('assert')

var EV = require('..')
var version = require('../package.json').version

describe('version property', function () {
    var ev = new EV()

    it('should applybe set correctly', function (done) {
      assert.equal(version, EV.version)
      assert.equal(version, ev.version)
      done()
  })
})