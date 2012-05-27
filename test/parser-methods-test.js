/*
 * Parser methods tests
 */
var assert = require('assert')

var atokParser = require('..')
var options = {}

describe('Parser methods', function () {
  function dummyParser () {
    atok.addRule(1, 'data')
    atok.on('data', function (token) {
      self.emit_data(token)
    })
  }
  describe('#debug', function () {
    var Parser = atokParser.createParser(dummyParser, 'options')
    var p = new Parser(options)
    
    it('should turn debug on', function (done) {
      done()
    })
  })
})