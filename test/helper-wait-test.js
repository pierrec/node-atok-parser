/*
 * wait Helper tests
 */
var assert = require('assert')

var atokParser = require('..')

describe('helpers.wait()', function () {
  describe('with a single pattern', function () {
    describe('len==1', function () {
      function _Parser (handler) {
        atok.wait('_', handler)
      }

      var Parser = atokParser.createParser(_Parser)

      it('should call the handler', function (done) {
        function handler () {
          done()
        }

        var p = new Parser(handler)

        p.write('_')
      })
    })

    // TODO: This will fail for now
    false&&describe('len>1', function () {
      function _Parser (handler) {
        atok.wait('___', handler)
        atok.addRule(1, function () {
          require('assert')()
        })
      }

      var Parser = atokParser.createParser(_Parser)

      it('should call the handler', function (done) {
        function handler () {
          assert(i === 2)
          done()
        }
        
        var p = new Parser(handler)
        var i = 0

        p.write('_')
        i++
        p.write('_')
        i++
        p.write('_')
      })
    })

    describe('len>1 and no match', function () {
      function _Parser (handler) {
        atok.wait('__', handler)
      }

      var Parser = atokParser.createParser(_Parser)

      it('should not call the handler', function (done) {
        var p = new Parser(function () { assert() })

        p.write('_')
        p.write('*')
        p.write('_')
        done()
      })
    })
  })

  describe('with many patterns', function () {
    describe('first len==1', function () {
      function _Parser (handler) {
        atok.wait('_', '_', handler)
      }

      var Parser = atokParser.createParser(_Parser)

      it('should call the handler', function (done) {
        function handler () {
          done()
        }

        var p = new Parser(handler)

        p.write('_a_')
      })
    })

    describe('first len==1 and split write', function () {
      function _Parser (handler) {
        atok.wait('_', '_', handler)
      }

      var Parser = atokParser.createParser(_Parser)

      it('should call the handler', function (done) {
        function handler () {
          assert(i === 1)
          done()
        }

        var p = new Parser(handler)
        var i = 0

        p.write('_')
        i++
        p.write('a_')
      })
    })

    describe('first len==1 and some initial data', function () {
      function _Parser (handler) {
        atok.wait('_', '_', handler)
      }

      var Parser = atokParser.createParser(_Parser)

      it('should call the handler', function (done) {
        function handler () {
          assert(i === 1)
          done()
        }

        var p = new Parser(handler)
        var i = 0

        p.write('_a')
        i++
        p.write('a_')
      })
    })

    describe('first len>1', function () {
      function _Parser (handler) {
        atok.wait('__', '__', handler)
      }

      var Parser = atokParser.createParser(_Parser)

      it('should call the handler', function (done) {
        function handler () {
          assert(i === 3)
          done()
        }
        
        var p = new Parser(handler)
        var i = 0

        p.write('_')
        i++
        p.write('_a')
        i++
        p.write('_')
        i++
        p.write('_')
      })
    })

  })
})