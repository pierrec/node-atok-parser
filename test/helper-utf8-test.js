/*
 * Parser UTF-8 Helper tests
**/
var assert = require('assert')

var atokParser = require('..')
var options = {}

describe('Parser UTF-8 Helper', function () {
  describe('with false', function () {
      function myParser () {
        atok.utf8(false)
      }
      var Parser = atokParser.createParser(myParser, 'options')
      var p = new Parser(options)

      it('should ignore it', function (done) {
        function handler (token, idx, type) {
          done( new Error('Should not trigger') )
        }

        p.on('error', done)
        p.on('data', handler)
        p.write('a~b$c ')
        done()
      })
    })

  var Parser = atokParser.createParserFromFile('./parsers/utf8HelperParser.js', 'options')

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
        assert.equal(data, 'a\u00bdb')
        done()
      })
      p.write('"a\\u00bdb"')
    })
  })

  describe('with multiple UTF-8 characters', function () {
    var p = new Parser()

    it('should parse the input data', function (done) {
      p.on('data', function (data) {
        assert.equal(data, 'a\u00bdb\u00E9c')
        done()
      })
      p.write('"a\\u00bdb\\u00E9c"')
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