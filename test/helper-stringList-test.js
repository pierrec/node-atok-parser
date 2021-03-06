/*
 * Parser Helpers tests
 */
var assert = require('assert')

var atokParser = require('..')
var options = {}
var isError = require('util').isError

describe('helpers.stringList()', function () {
  describe('with false', function () {
      function myParser () {
        atok.stringList(false)
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

  describe('with an empty list', function () {
    var Parser = atokParser.createParserFromFile('./parsers/stringListHelperParser.js', 'options')
    var p = new Parser(options)

    it('should parse it', function (done) {
      function handler (token, idx, type) {
        switch (type) {
          case 'stringList':
            assert.deepEqual(token, [])
            done()
          break
          default:
            done( new Error('Unknown type: ' + type) )
        }
      }

      // p.on('error', done)
      p.on('data', handler)
      p.write('()')
    })
  })

  describe('with one list item', function () {
    var Parser = atokParser.createParserFromFile('./parsers/stringListHelperParser.js', 'options')
    var p = new Parser(options)

    it('should parse it', function (done) {
      function handler (token, idx, type) {
        switch (type) {
          case 'stringList':
            assert.deepEqual(token, ['a'])
            done()
          break
          default:
            done( new Error('Unknown type: ' + type) )
        }
      }

      p.on('error', console.log)
      p.on('data', handler)
      p.write('("a")')
    })
  })

  describe('with list items', function () {
    var Parser = atokParser.createParserFromFile('./parsers/stringListHelperParser.js', 'options')
    var p = new Parser(options)

    it('should parse it', function (done) {
      function handler (token, idx, type) {
        switch (type) {
          case 'stringList':
            assert.deepEqual(token, ['a','b'])
            done()
          break
          default:
            done( new Error('Unknown type: ' + type) )
        }
      }

      p.on('error', done)
      p.on('data', handler)
      p.write('("a","b")')
    })
  })

  describe('with list items and white spaces', function () {
    var Parser = atokParser.createParserFromFile('./parsers/stringListHelperParser.js', 'options')
    var p = new Parser(options)

    it('should parse it', function (done) {
      function handler (token, idx, type) {
        switch (type) {
          case 'stringList':
            assert.deepEqual(token, ['a','b'])
            done()
          break
          default:
            done( new Error('Unknown type: ' + type) )
        }
      }

      p.on('error', done)
      p.on('data', handler)
      p.write('( "a" , "b" )')
    })
  })

  describe('with an invalid list start', function () {
    var Parser = atokParser.createParserFromFile('./parsers/stringListHelperParser.js', 'options')
    var p = new Parser(options)

    it('should continue and emit an error', function (done) {
      p.on('error', function () {
        done()
      })
      p.write(' "a", "b" )')
    })
  })

  describe('with an invalid list end', function () {
    var Parser = atokParser.createParserFromFile('./parsers/stringListHelperParser.js', 'options')
    var p = new Parser(options)

    it('should continue and emit an error', function (done) {
      p.on('error', function () {
        done()
      })
      p.write('( "a", "b" ]')
    })
  })

  describe('with an invalid separator', function () {
    var Parser = atokParser.createParserFromFile('./parsers/stringListHelperParser.js', 'options')
    var p = new Parser(options)

    it('should continue and emit an error', function (done) {
      p.on('error', function () {
        done()
      })
      p.write('( "a"  "b" )')
    })
  })

  describe('with a split string', function () {
    var Parser = atokParser.createParserFromFile('./parsers/stringListHelperParser.js', 'options')
    var p = new Parser(options)
    var err

    it('should wait and parse it', function (done) {
      function handler (token, idx, type) {
        switch (type) {
          case 'stringList':
            assert.deepEqual(token, ['abc'])
            done()
          break
          default:
            err = new Error('Unknown type: ' + type)
        }
      }

      p.on('error', done)
      p.on('data', handler)
      p.write('( "ab')
      p.write('c" )')
    })
  })

  describe('with single quoted list items', function () {
    var Parser = atokParser.createParserFromFile('./parsers/stringListHelperParser.js', 'options')
    var p = new Parser(options)

    it('should parse it', function (done) {
      function handler (token, idx, type) {
        switch (type) {
          case 'stringList':
            assert.deepEqual(token, ['a','b'])
            done()
          break
          default:
            done( new Error('Unknown type: ' + type) )
        }
      }

      p.on('error', done)
      p.on('data', handler)
      p.write("( 'a', 'b' )")
    })
  })

  describe('with an error', function () {
    var Parser = atokParser.createParserFromFile('./parsers/stringListHelperParser.js', 'options')
    var p = new Parser(options)

    it('should not parse it', function (done) {
      function handler (token, idx, type) {
        switch (type) {
          case 'stringList':
            assert( isError(token) )
            assert.deepEqual(token.list, [])
            p.pause()
            done()
          break
          default:
            done( new Error('Unknown type: ' + type) )
        }
      }

      p.on('error', done)
      p.on('data', handler)
      p.write("( ~'a', 'b' )")
    })
  })

  describe('with an error #2', function () {
    var Parser = atokParser.createParserFromFile('./parsers/stringListHelperParser.js', 'options')
    var p = new Parser(options)

    it('should not parse it', function (done) {
      function handler (token, idx, type) {
        switch (type) {
          case 'stringList':
            assert( isError(token) )
            assert.deepEqual(token.list, ['a'])
            p.pause()
            done()
          break
          default:
            done( new Error('Unknown type: ' + type) )
        }
      }

      p.on('error', done)
      p.on('data', handler)
      p.write("( 'a' 'b' )")
    })
  })
})