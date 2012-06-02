/*
 * Find Helper tests
**/
var assert = require('assert')

var atokParser = require('..')
var options = {}

describe('Parser Helpers', function () {
    var p, err

    function getHandler (expectedMatch, done) {
      return function handler (token, idx, type) {
        switch (type) {
          case 'match':
            assert.equal(token, expectedMatch)
            done(err)
          break
          default:
            err = new Error('Unknown type: ' + type)
        }
      }
    }

  describe('helpers.match()', function () {
    var Parser = atokParser.createParserFromFile('./parsers/matchHelperParser.js', 'options')

    beforeEach(function (done) {
      p = new Parser(options)
      p.on('error', function (e) { err = e })
      err = null
      done()
    })

    describe('with no match', function () {
      it('should skip it', function (done) {
        function handler (token, idx, type) {
          err = new Error('Handler should not be called')
        }

        p.on('data', handler)
        p.write('abc)def')
        p._resolveRules()
        console.log(p.atok._rules)
        assert.equal(p.atok.offset, 0)
        done(err)
      })
    })

    describe('with full data match', function () {
      it('should parse it', function (done) {
        p.on('data', getHandler('abc', done))
        p.write('(abc)')
      })
    })

    false&&describe('with end not in a string', function () {
      var p = new Parser(options)
      it('should parse it', function (done) {
        p.on('data', getHandler('abc', done))
        p.write('(abc)def')
      })
    })

    false&&describe('with end in a string', function () {
      it('should parse it', function (done) {
        p.on('data', getHandler('a"b)c"d', done))
        p.write('(a"b)c"d)ef')
      })
    })

    false&&describe('with a split end', function () {
      it('should parse it when string ends', function (done) {
        p.on('data', getHandler('abcd', done))
        p.write('(abc')
        p.write('d)ef')
      })
    })

    false&&describe('with a split end in a string', function () {
      it('should parse it when string ends', function (done) {
        p.on('data', getHandler('a"b)cd"', done))
        p.write('(a"b)cd"')
        p.write(')ef')
      })
    })

    false&&describe('with a split end in a split string', function () {
      it('should parse it when string ends', function (done) {
        p.on('data', getHandler('a"b)cd"', done))
        p.debug(console.log)
        // console.log(p.atok._rules)
        p.write('(a"b)c')
        console.log('___')
        p.write('d")ef')
      })
    })
  })

  false&&describe('helpers.match() with data match', function () {
    function _Parser (options) {
      atok
        .trimLeft(!options.trimLeft)
        .trimRight(!options.trimRight)
        .match('(', ')')
    }

    var Parser = atokParser.createParser(_Parser)

    describe('trimLeft(true)', function () {
      var p = new Parser({ trimLeft: true })

      it('should parse it', function (done) {
        p.atok.on('data', getHandler('(abc', done))
        p.write('(abc)')
      })
    })

    describe('trimRight(true)', function () {
      var p = new Parser({ trimRight: true })

      it('should parse it', function (done) {
        p.atok.on('data', getHandler('abc)', done))
        p.write('(abc)')
      })
    })

    describe('trimLeft(true).trimRight(true)', function () {
      var p = new Parser({ trimLeft: true, trimRight: true })

      it('should parse it', function (done) {
        p.atok.on('data', getHandler('(abc)', done))
        p.write('(abc)')
      })
    })
  })
})