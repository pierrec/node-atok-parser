/*
 * Float Helper with delimiter tests
**/
var assert = require('assert')

var atokParser = require('..')
var options = {}

describe('Parser Helpers', function () {
  describe('helpers.float()', function () {
    describe('with a full float as a positive integer', function () {
      var Parser = atokParser.createParser('./parsers/floatDelimHelperParser.js', 'options')
      var p = new Parser(options)

      it('should parse it', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'float':
              assert.equal(token, 123)
              done()
            break
            default:
              done( new Error('Unknown type: ' + type) )
          }
        }

        p.on('error', done)
        p.on('data', handler)
        p.write('123,456')
      })
    })
  })
})