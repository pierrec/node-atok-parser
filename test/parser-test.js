/*
 * Parser tests
**/
var assert = require('assert')

var atokParser = require('..')
var options = {}

describe('Parser', function () {
  it('should provide its version', function (done) {
    assert.equal(typeof atokParser.version, 'string')
    done()
  })

  describe('a new Parser', function () {
    it('should initialize with no arguments', function (done) {
      var Parser = atokParser.createParser('./parsers/dummyParser.js')
      var p = new Parser

      assert.equal(typeof p.atok, 'object')
      done()
    })
  })

  describe('a new Parser', function () {
    it('should initialize with arguments', function (done) {
      var Parser = atokParser.createParser('./parsers/dummyParser.js', 'options')
      var p = new Parser

      assert.equal(typeof p.atok, 'object')
      done()
    })
  })
  
  describe('a new Parser', function () {
    var Parser = atokParser.createParser('./parsers/dummyParser.js', 'options')
    var p = new Parser(options)
    
    it('should have default methods', function (done) {
      assert.equal(typeof p.pause, 'function')
      assert.equal(typeof p.resume, 'function')
      assert.equal(typeof p.write, 'function')
      assert.equal(typeof p.end, 'function')
      assert.equal(typeof p.track, 'function')
      assert.equal(typeof p.trackError, 'function')
      done()
    })
  })

  describe('a new Parser', function () {
    var Parser = atokParser.createParser('./parsers/dummyParser.js', 'options')
    var p = new Parser(options)

    it('should parse the input data', function (done) {
      function handler (token, idx, type) {
        switch (type) {
          case 'digit':
            assert.equal(token, '1')
          break
          case 'char':
            assert.equal(token, 'a')
          break
          case 'end':
            done()
          break
          default:
            done( new Error('Unknown type: ' + type) )
        }
      }

      p.on('error', done)
      p.on('data', handler)
      p.write('1a')
    })
  })
})