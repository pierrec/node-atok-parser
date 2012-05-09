/*
 * Parser Helpers Default Behaviour tests
**/
var assert = require('assert')

var atokParser = require('..')
var options = {}

describe('Parser Helpers Default Behaviour', function () {
  function emit_data (token, idx, type) {
    self.emit_data(token, idx, type)
  }

  function emit_error (err, token) {
    var newerr = self.trackError(err, token, 3)
    self.emit_error(newerr)
  }

  var defaultData = [
      "atok.addRule('', 'no-match')"
    , emit_data.toString()
    , "atok.on('data', emit_data)"
    , emit_error.toString()
    , "atok.on('error', emit_error)"
    , "atok.saveRuleSet('main')"
    , "atok.clearRule()"
    , "atok.addRule('abc', 'test')"
    , "atok.saveRuleSet('test')"
    , "atok.loadRuleSet('main')"
    ]

  var p, err, found, dataFound, args

  function getHandler (expectedType) {
    return function (token, idx, type) {
      switch (type) {
        case expectedType:
          found = true
          dataFound = token
          args = arguments
        break
        case 'no-match':
        case 'test':
        break
        default:
          err = new Error('Unknown type: ' + type)
      }
    }
  }

  function init (data, type, done) {
    var Parser = atokParser.createParser(data, 'options')
    p = new Parser(options)
    p.on('error', function (e) { err = e })
    p.on('data', getHandler(type, done))
    err = null
    found = false
    dataFound = null
  }

  function testHelper (helper, helperRule, helperData, expectedData, expectedDataType) {
    describe( '[' + helper + ']:', function () {
      var data = [].concat(
        helperRule
      , defaultData
      )

      describe('if no match', function () {
        it('should go to the next rule', function (done) {
          init(data, 'no-match')
          p.write('<')
          assert(found)
          done(err)
        })
      })

      describe('if match', function () {
        it('should call the handler', function (done) {
          init(data, helper)
          p.atok.removeRule('no-match')
          p.write(helperData)
          p.write(' ')
          assert(found)
          assert.equal(p.atok.length, 1)
          assert.deepEqual(dataFound, expectedData)
          done(err)
        })
      })

      describe('if match', function () {
        it('should set the proper handler signature', function (done) {
          init(data, helper)
          p.atok.removeRule('no-match')
          p.write(helperData)
          p.write(' ')
          assert(!!args)
          assert.equal(args.length, 3)
          assert.equal(typeof args[0], expectedDataType)
          assert.equal(typeof args[1], 'number')
          assert.equal(typeof args[2], 'string')
          done(err)
        })
      })

      describe('if match and #next() used', function () {
        it('should call the handler and set the next rule set', function (done) {
          init(["atok.next('test')"].concat(data), helper)
          p.write(helperData)
          p.write(' ')
          assert(found)
          assert.equal(p.atok.currentRule, 'test')
          done(err)
        })
      })

      describe('if match and #ignore() used', function () {
        it('should not call the handler', function (done) {
          init(["atok.ignore(true)"].concat(data), helper)
          p.write(helperData)
          p.write(' ')
          assert(!found)
          done(err)
        })
      })

      describe('if match and #quiet() used', function () {
        it('should call the handler with the matched size', function (done) {
          init(["atok.quiet(true)"].concat(data), helper)
          p.write(helperData)
          p.write(' ')
          assert(found)
          assert.equal(typeof dataFound === 'number' ? dataFound : dataFound.length, expectedData.length)
          done(err)
        })
      })

      describe('on end(data)', function () {
        it('should call the handler with the data', function (done) {
          init(data, helper)
          p.end(helperData)
          assert(found)
          assert.deepEqual(dataFound, expectedData)
          done(err)
        })
      })

      describe('on write(data).end()', function () {
        it('should call the handler with the data', function (done) {
          init(data, helper)
          p.write(helperData)
          p.end()
          assert(found)
          assert.deepEqual(dataFound, expectedData)
          done(err)
        })
      })
    })
  }

  testHelper('chunk', "atok.chunk({ start: 'a~$', end: 'z~$'})", 'abc', 'abc', 'string')
  testHelper('float', "atok.float()", '123.456', '123.456', 'number')
  testHelper('match', "atok.match('(',')')", '(123.456)', '123.456', 'string')
  testHelper('number', "atok.number()", '123', '123', 'number')
  testHelper('string', "atok.string()", '"abc"', 'abc', 'string')
  testHelper('stringList', "atok.stringList('(',')')", '("abc")', ['abc'], 'object')
  testHelper('utf8', "atok.utf8()", '"a\u00e0bc"', 'aàbc', 'string')
  testHelper('word', "atok.word()", 'abc', 'abc', 'string')

  describe('whitespace', function () {
    var data = [].concat(
      "atok.whitespace()"
    , defaultData
    )

    describe('if no match', function () {
      it('should go to the next rule', function (done) {
        init(data, 'no-match')
        p.write('<')
        done()
      })
    })
  })
})