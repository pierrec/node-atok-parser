/*
 * Parser UTF-8 Helper tests
**/
var assert = require('assert')

var atokParser = require('..')
var options = {}

describe('Parser UTF-8 Helper', function () {
  var Parser = atokParser.createParser('./parsers/utf8HelperParser.js', 'options')

  describe('with non UTF-8 characters', function () {
    var p = new Parser()

    it('should parse the input data', function (done) {
      p.on('data', function (data) {
        assert.equal(data, 'abcé123')
        done()
      })
      p.write('"abcé123"')
    })
  })

  describe('with special characters', function () {
    var p = new Parser()

    it('should parse the input data', function (done) {
      p.on('data', function (data) {
        assert.equal(data, '"\n')
        done()
      })
      p.write('"\\"\\n"')
    })
  })

  describe('with UTF-8 characters', function () {
    var p = new Parser()

    it('should parse the input data', function (done) {
      p.on('data', function (data) {
        assert.equal(data, 'a\u0123b')
        done()
      })
      p.write('"a\\u0123b"')
    })
  })

  describe('successive parses', function () {
    var p = new Parser()
    var count = 0

    it('should parse the input data', function (done) {
      p.on('data', function (data) {
        assert.equal(data, 'a\u0123b')
        count++
        if (count === 2) done()
      })
      p.write('"a\\u0123b"')
      p.write('"a\\u0123b"')
    })
  })
})