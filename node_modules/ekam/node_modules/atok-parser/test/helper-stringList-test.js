/*
 * Parser Helpers tests
**/
var assert = require('assert')

var atokParser = require('..')
var options = {}

describe('helpers.stringList()', function () {
  describe('with an empty list', function () {
    var Parser = atokParser.createParser('./parsers/stringListHelperParser.js', 'options')
    var p = new Parser(options)

    it('should parse it', function (done) {
      function handler (token, idx, type) {
        switch (type) {
          case 'stringList':
            assert.deepEqual(token, [])
            done()
          break
          default:
            done( new Error('Unknown type: ' + type) )
        }
      }

      p.on('error', done)
      p.on('data', handler)
      p.write('()')
    })
  })

  describe('with list items', function () {
    var Parser = atokParser.createParser('./parsers/stringListHelperParser.js', 'options')
    var p = new Parser(options)

    it('should parse it', function (done) {
      function handler (token, idx, type) {
        switch (type) {
          case 'stringList':
            assert.deepEqual(token, ['a','b'])
            done()
          break
          default:
            done( new Error('Unknown type: ' + type) )
        }
      }

      p.on('error', done)
      p.on('data', handler)
      p.write('("a","b")')
    })
  })

  describe('with list items and white spaces', function () {
    var Parser = atokParser.createParser('./parsers/stringListHelperParser.js', 'options')
    var p = new Parser(options)

    it('should parse it', function (done) {
      function handler (token, idx, type) {
        switch (type) {
          case 'stringList':
            assert.deepEqual(token, ['a','b'])
            done()
          break
          default:
            done( new Error('Unknown type: ' + type) )
        }
      }

      p.on('error', done)
      p.on('data', handler)
      p.write('( "a" , "b" )')
    })
  })

  describe('with an error', function () {
    var Parser = atokParser.createParser('./parsers/stringListHelperParser.js', 'options')
    var p = new Parser(options)

    it('should parse it', function (done) {
      p.on('error', function () {
        done()
      })
      p.write('( "a"  "b" )')
    })
  })

  describe('with single quoted list items', function () {
    var Parser = atokParser.createParser('./parsers/stringListHelperParser.js', 'options')
    var p = new Parser(options)

    it('should parse it', function (done) {
      function handler (token, idx, type) {
        switch (type) {
          case 'stringList':
            assert.deepEqual(token, ['a','b'])
            done()
          break
          default:
            done( new Error('Unknown type: ' + type) )
        }
      }

      p.on('error', done)
      p.on('data', handler)
      p.write("( 'a', 'b' )")
    })
  })
})