/*
 * Parser Helpers tests
**/
var assert = require('assert')

var atokParser = require('..')
var options = {}

describe('Parser Helpers', function () {
  describe('helpers.chunk()', function () {
    describe('with a whole chunk', function () {
      var Parser = atokParser.createParser('./parsers/chunkHelperParser.js', 'options')
      var p = new Parser(options)

      it('should parse it', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'chunk':
              assert.equal(token, 'a~b$c')
            break
            default:
              done( new Error('Unknown type: ' + type) )
          }
        }

        p.on('error', done)
        p.on('data', handler)
        p.write('a~b$c ')
        done()
      })
    })

    describe('with a split up chunk', function () {
      var Parser = atokParser.createParser('./parsers/chunkHelperParser.js', 'options')
      var p = new Parser(options)

      it('should parse it', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'chunk':
              assert.equal(token, 'a~bca$bc')
            break
            default:
              done( new Error('Unknown type: ' + type) )
          }
        }

        p.on('error', done)
        p.on('data', handler)
        p.write('a~bc')
        assert.equal(p.atok.length, 0)
        p.write('a$bc ')
        done()
      })
    })

    describe('with a non ending chunk', function () {
      var Parser = atokParser.createParser('./parsers/chunkHelperParser.js', 'options')
      var p = new Parser(options)
      
      it('should not parse it', function (done) {
        var res

        function handler (token, idx, type) {
          switch (type) {
            case 'chunk':
              assert.equal(token, 'a~bc')
              res = token
            break
            default:
              done( new Error('Unknown type: ' + type) )
          }
        }

        p.on('error', done)
        p.on('data', handler)
        p.write('a~bc')
        assert.equal(res, undefined)
        done()
      })
    })
  })
})