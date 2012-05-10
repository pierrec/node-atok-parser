/*
 * Parser Helpers tests
**/
var assert = require('assert')

var atokParser = require('..')
var options = {}

describe('Parser Helpers', function () {
  describe('helpers.word()', function () {
    describe('with a whole word', function () {
      var Parser = atokParser.createParserFromFile('./parsers/wordHelperParser.js', 'options')
      var p = new Parser(options)
      var err

      it('should parse it', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'word':
              assert.equal(token, 'abc')
            break
            default:
              err = new Error('Unknown type: ' + type)
          }
        }

        p.on('data', handler)
        p.write('abc ')
        done(err)
      })
    })

    describe('with a split up word', function () {
      var Parser = atokParser.createParserFromFile('./parsers/wordHelperParser.js', 'options')
      var p = new Parser(options)
      var err

      it('should parse it', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'word':
              assert.equal(token, 'abcabc')
            break
            default:
              err = new Error('Unknown type: ' + type)
          }
        }

        p.on('data', handler)
        p.write('abc')
        p.write('abc ')
        done(err)
      })
    })

    describe('with a non ending word', function () {
      var Parser = atokParser.createParserFromFile('./parsers/wordHelperParser.js', 'options')
      var p = new Parser(options)
      var err
      
      it('should not parse it', function (done) {
        var res

        function handler (token, idx, type) {
          switch (type) {
            case 'word':
              assert.equal(token, 'abc')
              res = token
            break
            default:
              err =  new Error('Unknown type: ' + type)
          }
        }

        p.on('data', handler)
        p.write('abc')
        assert.equal(res, undefined)
        done(err)
      })
    })
  })
})