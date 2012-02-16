/*
 * Parser Helpers Workflow tests
**/
var assert = require('assert')

var atokParser = require('..')
var options = {}

describe('Parser Helpers Workflow', function () {
  describe('mixin', function () {
    var Parser = atokParser.createParser('./workflowHelperParser.js', 'options')
    var p = new Parser()

    it('should parse the input data', function (done) {
      function handler (token, idx, type) {
        switch (type) {
          case 'number':
            assert.equal(token, 123)
          break
          case 'word':
            assert.equal(token, 'abc')
          break
          case 'string':
            assert.equal(token, '~$')
          break
          case 'float':
            assert.equal(token, 123.456e7)
          break
          default:
            done( new Error('Unknown type: ' + type) )
        }
      }

      p.on('error', done)
      p.on('data', handler)
      p.write(' 123\tabc\n"~$" 123.456e7 ')
      done()
    })
  })
})