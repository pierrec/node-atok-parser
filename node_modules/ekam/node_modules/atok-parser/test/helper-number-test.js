/*
 * Parser Helpers tests
**/
var assert = require('assert')

var atokParser = require('..')
var options = {}

describe('Parser Helpers', function () {
  describe('helpers.number()', function () {
    describe('with a full number', function () {
      var Parser = atokParser.createParser('./parsers/numberHelperParser.js', 'options')
      var p = new Parser(options)

      it('should parse it', function (done) {
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
        p.write('123 ')
      })
    })

    describe('with a split up number', function () {
      var Parser = atokParser.createParser('./parsers/numberHelperParser.js', 'options')
      var p = new Parser(options)

      it('should parse it', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'number':
              assert.equal(token, 123123)
            break
            default:
              done( new Error('Unknown type: ' + type) )
          }
        }

        p.on('error', done)
        p.on('data', handler)
        p.write('123')
        assert.equal(p.atok.length, 0)
        p.write('123 ')
        done()
      })
    })

    describe('with a non ending number', function () {
      var Parser = atokParser.createParser('./parsers/numberHelperParser.js', 'options')
      var p = new Parser(options)
      
      it('should not parse it', function (done) {
        var res

        function handler (token, idx, type) {
          switch (type) {
            case 'number':
              assert.equal(token, '123')
              res = token
            break
            default:
              done( new Error('Unknown type: ' + type) )
          }
        }

        p.on('error', done)
        p.on('data', handler)
        p.write('123')
        assert.equal(res, undefined)
        done()
      })
    })
  })
})