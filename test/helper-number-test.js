/*
 * Parser Helpers tests
**/
var assert = require('assert')

var atokParser = require('..')
var options = {}

describe('Parser Helpers', function () {
  describe('helpers.number()', function () {
    describe('with false', function () {
      function myParser () {
        atok.number(false)
      }
      var Parser = atokParser.createParser(myParser, 'options')
      var p = new Parser(options)

      it('should ignore it', function (done) {
        function handler (token, idx, type) {
          done( new Error('Should not trigger') )
        }

        p.on('error', done)
        p.on('data', handler)
        p.write('123 ')
        done()
      })
    })

    describe('with a full number', function () {
      var Parser = atokParser.createParserFromFile('./parsers/numberHelperParser.js', 'options')
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
      var Parser = atokParser.createParserFromFile('./parsers/numberHelperParser.js', 'options')
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
        p.write('123 ')
        done()
      })
    })

    // This case should work fine but taks *way* too long to complete
    false&&describe('with an invalid number', function () {
      var options = { flag: false }

      function _Parser (options) {
        atok.number()
        atok.addRule(3, function () {
          options.flag = true
        })
      }

      var Parser = atokParser.createParser(_Parser)
      var p = new Parser(options)

      it('should not parse it', function (done) {
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

        for (var i = 0, n = Number.MAX_VALUE / 40; i < n; i++)
          p.write('9999999999999999999999999999999999999999')

        p.write(' ')
        assert(options.flag)
        done()
      })
    })

    describe('with a non ending number', function () {
      var Parser = atokParser.createParserFromFile('./parsers/numberHelperParser.js', 'options')
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