/*
 * Parser Whitespace Helper tests
 */
var assert = require('assert')

var atokParser = require('..')
var options = {}

describe('helpers.whitespace()', function () {
  describe('with default options', function () {
    var Parser = atokParser.createParserFromFile('./parsers/whitespaceHelperParser.js', 'options')
    var p = new Parser

    it('should parse the input data', function (done) {
      p.on('error', done)
      p.write(' \t\n\r\n')
      assert.equal(p.atok.length, 0)
      done()
    })
  })

  describe('with specified whitespaces', function () {
    function wsParser () {
      atok.whitespace(['\n','\r','\t'])
    }
    var Parser = atokParser.createParser(wsParser)
    var p = new Parser

    it('should parse the input data except spaces', function (done) {
      p.on('error', done)
      p.write('\t\n\r\n ')
      assert.equal(p.atok.length, 1)
      done()
    })
  })

  describe('with a handler', function () {
    function wsParser (handler) {
      atok.whitespace(handler)
    }
    var Parser = atokParser.createParser(wsParser, 'handler')

    it('should parse the input and call the handler', function (done) {
      var match = 0
      function handler () {
        match++
      }
      var p = new Parser(handler)

      p.on('error', done)
      p.write('\t\n\r\n ')
      assert.equal(match, 5)
      done()
    })
  })

  describe('with specified whitespaces and a handler', function () {
    function wsParser (ws, handler) {
      atok.whitespace(ws, handler)
    }
    var Parser = atokParser.createParser(wsParser, 'ws,handler')

    it('should parse the input and call the handler', function (done) {
      var match = 0
      function handler () {
        match++
      }
      var p = new Parser(['\n','\r','\t'], handler)

      p.on('error', done)
      p.write('\t\n\r\n ')
      assert.equal(match, 4)
      done()
    })
  })
})