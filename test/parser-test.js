/*
 * Parser tests
**/
var assert = require('assert')
var fs = require('fs')
var path = require('path')

var atokParser = require('..')
var options = {}

describe('Parser', function () {
  describe('a new Parser', function () {
    it('should initialize with no arguments', function (done) {
      var Parser = atokParser.createParser('./dummyParser.js')
      var p = new Parser

      assert.equal(typeof p.atok, 'object')
      done()
    })
  })

  describe('a new Parser', function () {
    it('should initialize with arguments', function (done) {
      var Parser = atokParser.createParser('./dummyParser.js', 'options')
      var p = new Parser

      assert.equal(typeof p.atok, 'object')
      done()
    })
  })
  
  describe('a new Parser', function () {
    var Parser = atokParser.createParser('./dummyParser.js', 'options')
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
            throw new Error('Unknown type: ' + type)
        }
      }

      p.on('error', done)
      p.on('data', handler)
      p.write('1a')
    })
  })
})