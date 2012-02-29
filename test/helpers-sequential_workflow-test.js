/*
 * Parser Helpers Workflow tests
**/
var assert = require('assert')

var atokParser = require('..')
var options = {}

describe('Parser Helpers Workflow', function () {
  describe('mixin', function () {
    var Parser = atokParser.createParser('./parsers/sequential_workflowHelperParser.js', 'options')
    var p = new Parser()
    var number, word, string, float, match

    it('should parse the input data', function (done) {
      function handler (token, idx, type) {
        switch (type) {
          case 'number':
            assert.equal(token, 123)
            number = true
          break
          case 'word':
            assert.equal(token, 'abc')
            word = true
          break
          case 'string':
            assert.equal(token, '~$')
            string = true
          break
          case 'float':
            assert.equal(token, 456.789e7)
            float = true
          break
          case 'match':
            assert.equal(token, '12ab')
            match = true
          break
          default:
            done( new Error('Unknown type: ' + type) )
        }
      }

      p.on('error', done)
      p.on('data', handler)
      p.write(' 123\tabc\n"~$" 456.789e7 (12ab) ')
      assert.equal(number, true)
      assert.equal(word, true)
      assert.equal(string, true)
      assert.equal(float, true)
      assert.equal(match, true)
      done()
    })
  })
})