/*
 * Parser Whitespace Helper tests
**/
var assert = require('assert')

var atokParser = require('..')
var options = {}

describe('Parser Helpers', function () {
  describe('helpers.whitespace()', function () {
    var Parser = atokParser.createParser('./parsers/whitespaceHelperParser.js', 'options')
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
})