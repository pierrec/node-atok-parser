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
    , "atok.addRule('abc', 'test')"
    , "atok.saveRuleSet('test')"
    , "atok.loadRuleSet('main')"
    , "atok.debug(true)"
    , "atok.on('debug',console.log)"
    ]

  var p, err, found

  function getHandler (expectedType, done) {
    return function (token, idx, type) {
      console.log(arguments)
      switch (type) {
        case expectedType:
          found = true
          done && done(err)
        break
        case 'no-match':
        break
        default:
          done( new Error('Unknown type: ' + type) )
      }
    }
  }

  function init (data, type, done) {
    var Parser = atokParser.createParserFromContent(data, 'options')
    p = new Parser(options)
    p.on('error', function (e) { err = e })
    p.on('data', getHandler(type, done))
    err = null
    found = false
  }

  false&&describe('chunk', function () {
    var data = [].concat(
      "atok.chunk({ start: 'a~$', end: 'z~$'})"
    , defaultData
    )

    false&&describe('if no match', function () {
      it('should go to the next rule', function (done) {
        init(data, 'no-match', done)
        p.write('<')
      })
    })

    false&&describe('if match', function () {
      it('should call the handler', function (done) {
        init(data, 'chunk', done)
        p.write('abc ')
      })
    })

    false&&describe('if match and #next() used', function () {
      it('should call the handler and set the next rule set', function (done) {
        init(["atok.next('test')"].concat(data), 'chunk', done)
        p.write('abc ')
        assert(found)
        assert.equal(p.atok.getRuleSet(), 'test')
      })
    })
  })

  false&&describe('float', function () {
    var data = [].concat(
      "atok.float()"
    , defaultData
    )

    false&&describe('if no match', function () {
      it('should go to the next rule', function (done) {
        init(data, 'no-match', done)
        p.write('<')
      })
    })

    false&&describe('if match', function () {
      it('should call the handler', function (done) {
        init(data, 'float', done)
        p.write('123.456 ')
      })
    })

    false&&describe('if match and #next() used', function () {
      it('should call the handler and set the next rule set', function (done) {
        init(["atok.next('test')"].concat(data), 'float', done)
        p.write('123.456 ')
        assert(found)
        assert.equal(p.atok.getRuleSet(), 'test')
      })
    })
  })

  false&&describe('match', function () {
    var data = [].concat(
      "atok.match('(', ')')"
    , defaultData
    )

    false&&describe('if no match', function () {
      it('should go to the next rule', function (done) {
        init(data, 'no-match', done)
        p.write('<')
      })
    })

    false&&describe('if match', function () {
      it('should call the handler', function (done) {
        init(data, 'match', done)
        p.write('(123.456)')
      })
    })

    false&&describe('if match and #next() used', function () {
      it('should call the handler and set the next rule set', function (done) {
        init(["atok.next('test')"].concat(data), 'match', done)
        p.write('(123.456)')
        assert(found)
        assert.equal(p.atok.getRuleSet(), 'test')
      })
    })
  })

  false&&describe('number', function () {
    var data = [].concat(
      "atok.number()"
    , defaultData
    )

    false&&describe('if no match', function () {
      it('should go to the next rule', function (done) {
        init(data, 'no-match', done)
        p.write('<')
      })
    })

    false&&describe('if match', function () {
      it('should call the handler', function (done) {
        init(data, 'number', done)
        p.write('123 ')
      })
    })

    false&&describe('if match and #next() used', function () {
      it('should call the handler and set the next rule set', function (done) {
        init(["atok.next('test')"].concat(data), 'number', done)
        p.write('123 ')
        assert(found)
        assert.equal(p.atok.getRuleSet(), 'test')
      })
    })
  })

  false&&describe('string', function () {
    var data = [].concat(
      "atok.string()"
    , defaultData
    )

    false&&describe('if no match', function () {
      it('should go to the next rule', function (done) {
        init(data, 'no-match', done)
        p.write('<')
      })
    })

    false&&describe('if match', function () {
      it('should call the handler', function (done) {
        init(data, 'string', done)
        p.write('"abc" ')
      })
    })

    false&&describe('if match and #next() used', function () {
      it('should call the handler and set the next rule set', function (done) {
        init(["atok.next('test')"].concat(data), 'string', done)
        p.write('"abc" ')
        assert(found)
        assert.equal(p.atok.getRuleSet(), 'test')
      })
    })
  })

  describe('stringList', function () {
    var data = [].concat(
      "atok.stringList('(',')')"
    , defaultData
    )

    false&&describe('if no match', function () {
      it('should go to the next rule', function (done) {
        init(data, 'no-match', done)
        p.write('<')
      })
    })

    describe('if match', function () {
      it('should call the handler', function (done) {
        init(data, 'stringList', done)
        p.write('("abc")')
      })
    })

    false&&describe('if match and #next() used', function () {
      it('should call the handler and set the next rule set', function (done) {
        init(["atok.next('test')"].concat(data), 'stringList', done)
        p.write('("abc")')
        assert(found)
        assert.equal(p.atok.getRuleSet(), 'test')
      })
    })
  })

  false&&describe('utf8', function () {
    var data = [].concat(
      "atok.utf8()"
    , defaultData
    )

    false&&describe('if no match', function () {
      it('should go to the next rule', function (done) {
        init(data, 'no-match', done)
        p.write('<')
      })
    })

    false&&describe('if match', function () {
      it('should call the handler', function (done) {
        init(data, 'utf8', done)
        p.write('"a\u00c1bc" ')
      })
    })

    false&&describe('if match and #next() used', function () {
      it('should call the handler and set the next rule set', function (done) {
        init(["atok.next('test')"].concat(data), 'utf8', done)
        p.write('"a\u00c1bc" ')
        assert(found)
        assert.equal(p.atok.getRuleSet(), 'test')
      })
    })
  })

  false&&describe('whitespace', function () {
    var data = [].concat(
      "atok.whitespace()"
    , defaultData
    )

    false&&describe('if no match', function () {
      it('should go to the next rule', function (done) {
        init(data, 'no-match', done)
        p.write('<')
      })
    })
  })

  false&&describe('word', function () {
    var data = [].concat(
      "atok.word()"
    , defaultData
    )

    false&&describe('if no match', function () {
      it('should go to the next rule', function (done) {
        init(data, 'no-match', done)
        p.write('<')
      })
    })

    false&&describe('if match', function () {
      it('should call the handler', function (done) {
        init(data, 'word', done)
        p.write('abc ')
      })
    })

    false&&describe('if match and #next() used', function () {
      it('should call the handler and set the next rule set', function (done) {
        init(["atok.next('test')"].concat(data), 'word', done)
        p.write('abc ')
        assert(found)
        assert.equal(p.atok.getRuleSet(), 'test')
      })
    })
  })
})