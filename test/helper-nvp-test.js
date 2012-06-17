/*
 * Parser Helpers tests
 */
var assert = require('assert')

var atokParser = require('..')
var options = {}

describe('Parser Helpers', function () {
  describe('helpers.nvp()', function () {
    describe('with false', function () {
      function myParser () {
        atok.nvp(false)
      }
      var Parser = atokParser.createParser(myParser, 'options')
      var p = new Parser(options)

      it('should ignore it', function (done) {
        function handler (token, idx, type) {
          done( new Error('Should not trigger') )
        }

        p.on('error', done)
        p.on('data', handler)
        p.write('a~b$c ')
        done()
      })
    })

    describe('with a whole nvp', function () {
      var Parser = atokParser.createParserFromFile('./parsers/nvpHelperParser.js', 'options')
      var p = new Parser(options)

      it('should parse it', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'nvp':
              assert.deepEqual(token, { name: '_var_', value: 'value' })
            break
            default:
              done( new Error('Unknown type: ' + type) )
          }
        }

        p.on('data', handler)
        p.write('_var_="value"')
        done()
      })
    })

    describe('with a whole nvp and whitespaces', function () {
      var Parser = atokParser.createParserFromFile('./parsers/nvpHelperParser.js', 'options')
      var p = new Parser(options)

      it('should parse it', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'nvp':
              assert.deepEqual(token, { name: '_var_', value: 'value' })
            break
            default:
              done( new Error('Unknown type: ' + type) )
          }
        }

        p.on('data', handler)
        p.write('_var_ \n=\t"value"')
        done()
      })
    })

    describe('with a split up nvp #1', function () {
      var Parser = atokParser.createParserFromFile('./parsers/nvpHelperParser.js', 'options')
      var p = new Parser(options)

      it('should parse it', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'nvp':
              assert.deepEqual(token, { name: '_var_', value: 'value' })
            break
            default:
              done( new Error('Unknown type: ' + type) )
          }
        }

        p.on('data', handler)
        p.write('_var_')
        p.write('="value"')
        done()
      })
    })

    describe('with a split up nvp #2', function () {
      var Parser = atokParser.createParserFromFile('./parsers/nvpHelperParser.js', 'options')
      var p = new Parser(options)

      it('should parse it', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'nvp':
              assert.deepEqual(token, { name: '_var_', value: 'value' })
            break
            default:
              done( new Error('Unknown type: ' + type) )
          }
        }

        p.on('data', handler)
        p.write('_var_=')
        p.write('"value"')
        done()
      })
    })

    describe('with a split up nvp #3', function () {
      var Parser = atokParser.createParserFromFile('./parsers/nvpHelperParser.js', 'options')
      var p = new Parser(options)

      it('should parse it', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'nvp':
              assert.deepEqual(token, { name: '_var_', value: 'value' })
            break
            default:
              done( new Error('Unknown type: ' + type) )
          }
        }

        p.on('data', handler)
        p.write('_var_="va')
        p.write('lue"')
        done()
      })
    })

    describe('with an unquoted value', function () {
      var Parser = atokParser.createParserFromFile('./parsers/nvpHelperParser.js', 'options')
      var p = new Parser(options)

      it('should parse it', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'nvp':
              assert.deepEqual(token, { name: '_var_', value: 'value' })
            break
            default:
              done( new Error('Unknown type: ' + type) )
          }
        }

        p.on('data', handler)
        p.write('_var_=value ')
        done()
      })
    })

    describe('with an unquoted value and custom ending pattern', function () {
      var Parser = atokParser.createParserFromFile('./parsers/nvpHelperParser.js', 'options')
      var p = new Parser({ ending: { firstOf: '> ' } })

      it('should parse it', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'nvp':
              assert.deepEqual(token, { name: '_var_', value: 'value' })
            break
            default:
              done( new Error('Unknown type: ' + type) )
          }
        }

        p.on('data', handler)
        p.write('_var_= value> ')
        done()
      })
    })

    describe('with an unquoted value and custom ending pattern disabled', function () {
      var Parser = atokParser.createParserFromFile('./parsers/nvpHelperParser.js', 'options')
      var p = new Parser({ ending: '' })

      it('should not parse it', function (done) {
        function handler (token, idx, type) {
          done( new Error('Shoud not trigger') )
        }

        p.on('data', handler)
        p.write('_var_= value> ')
        done()
      })
    })
  })
})