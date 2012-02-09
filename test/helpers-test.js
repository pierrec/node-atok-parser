/*
 * Parser Helpers tests
**/
var assert = require('assert')
var fs = require('fs')
var path = require('path')

var atokParser = require('..')
var options = {}

describe('Parser Helpers', function () {
  describe('helpers.whitespace()', function () {
    var Parser = atokParser.createParser('./helpersParser.js', 'options')
    // Make sure we can count the whitespaces
    var p = new Parser({ ws: 'whitespace' })

    it('should parse the input data', function (done) {
      var matches = 0
      function handler (token, idx, type) {
        switch (type) {
          case 'whitespace':
            matches++
          break
          default:
            done( new Error('Unknown type: ' + type) )
        }
      }

      p.on('error', done)
      p.on('data', handler)
      p.write(' \t\n\r\n')
      assert.equal(matches, 5)
      done()
    })
  })

  describe('helpers.word()', function () {
    describe('with a whole word', function () {
      var Parser = atokParser.createParser('./helpersParser.js', 'options')
      var p = new Parser(options)

      it('should parse it', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'word':
              assert.equal(token, 'abc')
            break
            case 'end':
            break
            default:
              done( new Error('Unknown type: ' + type) )
          }
        }

        p.on('error', done)
        p.on('data', handler)
        p.write(' abc ')
        done()
      })
    })

    describe('with a split word', function () {
      var Parser = atokParser.createParser('./helpersParser.js', 'options')
      var p = new Parser(options)
      
      it('should parse it', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'word':
              assert.equal(token, 'abc')
            break
            default:
              done( new Error('Unknown type: ' + type) )
          }
        }

        p.on('error', done)
        p.on('data', handler)
        p.write(' ab')
        p.write('c ')
        done()
      })
    })
  })

  describe('helpers.number()', function () {
    var Parser = atokParser.createParser('./helpersParser.js', 'options')
    var p = new Parser(options)

    it('should parse the input data', function (done) {
      function handler (token, idx, type) {
        switch (type) {
          case 'number':
            assert.equal(token, 123)
            done()
          break
          default:
            done( new Error('Unknown type: ' + type) )
        }
      }

      p.on('error', done)
      p.on('data', handler)
      p.write(' 123 ')
    })
  })
})