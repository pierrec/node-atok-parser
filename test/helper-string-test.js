/*
 * Parser String Helper tests
**/
var assert = require('assert')

var atokParser = require('..')
var options = {}

describe('helpers.string()', function () {
  var Parser = atokParser.createParser('./parsers/stringHelperParser.js', 'options')

  describe('with a full string', function () {
    var p = new Parser()

    it('should parse the input data', function (done) {
      var matches = 0
      function handler (token, idx, type) {
        switch (type) {
          case 'string':
            assert.equal(token, 'abc')
            done()
          break
          default:
            done( new Error('Unknown type: ' + type) )
        }
      }

      p.on('error', done)
      p.on('data', handler)
      p.write('"abc"')
    })
  })

  describe('with a split up string', function () {
    var p = new Parser()

    it('should parse the input data', function (done) {
      var matches = 0
      function handler (token, idx, type) {
        switch (type) {
          case 'string':
            assert.equal(token, 'abc')
            done()
          break
          default:
            done( new Error('Unknown type: ' + type) )
        }
      }

      p.on('error', done)
      p.on('data', handler)
      p.write('"ab')
      p.write('c"')
    })
  })

  describe('with a single quoted string', function () {
    var p = new Parser({ start: "'" })

    it('should parse the input data', function (done) {
      var matches = 0
      function handler (token, idx, type) {
        switch (type) {
          case 'string':
            assert.equal(token, 'abc')
            done()
          break
          default:
            done( new Error('Unknown type: ' + type) )
        }
      }

      p.on('error', done)
      p.on('data', handler)
      p.write("'ab")
      p.write("c'")
    })
  })

  describe('with different delimiters string', function () {
    var p = new Parser({ start: '<', end: '>' })

    it('should parse the input data', function (done) {
      var matches = 0
      function handler (token, idx, type) {
        switch (type) {
          case 'string':
            assert.equal(token, 'abc')
            done()
          break
          default:
            done( new Error('Unknown type: ' + type) )
        }
      }

      p.on('error', done)
      p.on('data', handler)
      p.write("<abc>")
    })
  })
})