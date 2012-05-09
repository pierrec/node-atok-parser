/*
 * Parser Helpers Workflow tests
**/
var assert = require('assert')

var Helpers = require('..').Helpers
var options = {}

describe('Parser Helpers Argument Setting', function () {
  describe('setDelimiterArguments', function () {
    var delimiters = ['a']
    
    function handler () {}

    function test () {
      return Helpers._helper_setArguments([null], arguments, 'test')
    }

    describe('with no argument', function () {
      it('should set delimiters and handler', function (done) {
        var args = test()

        assert.equal(args.length, 2)
        assert.deepEqual(args[0], null)
        assert.equal(typeof args[1], 'function')

        done()
      })
    })

    describe('with delimiter argument', function () {
      it('should set delimiters and handler', function (done) {
        var args = test(delimiters)

        assert.equal(args.length, 2)
        assert.deepEqual(args[0], delimiters)
        assert.equal(typeof args[1], 'function')

        done()
      })
    })

    describe('with handler argument', function () {
      it('should set delimiters and handler', function (done) {
        var args = test(handler)

        assert.equal(args.length, 2)
        assert.deepEqual(args[0], null)
        assert.deepEqual(args[1], handler)

        done()
      })
    })

    describe('with delimiter and handler arguments', function () {
      it('should set delimiters and handler', function (done) {
        var args = test(delimiters, handler)

        assert.equal(args.length, 2)
        assert.deepEqual(args[0], delimiters)
        assert.deepEqual(args[1], handler)

        done()
      })
    })
  })

  describe('setStartEndArguments', function () {
    var start = '<', end = '>'
    var defaultDelim = '"'
    
    function handler () {}

    function test () {
      return Helpers._helper_setArguments(['"', '"'], arguments, 'test')
    }

    describe('with no argument', function () {
      it('should set start, end and handler', function (done) {
        var args = test()

        assert.equal(args.length, 3)
        assert.deepEqual(args[0], defaultDelim)
        assert.deepEqual(args[1], defaultDelim)
        assert.equal(typeof args[2], 'function')

        done()
      })
    })

    describe('with start and end arguments', function () {
      it('should set start, end and handler', function (done) {
        var args = test(start, end)

        assert.equal(args.length, 3)
        assert.deepEqual(args[0], start)
        assert.deepEqual(args[1], end)
        assert.deepEqual(typeof args[2], 'function')

        done()
      })
    })

    describe('with handler argument', function () {
      it('should set start, end and handler', function (done) {
        var args = test(handler)

        assert.equal(args.length, 3)
        assert.deepEqual(args[0], defaultDelim)
        assert.deepEqual(args[1], defaultDelim)
        assert.deepEqual(args[2], handler)

        done()
      })
    })

    describe('with start, end and handler arguments', function () {
      it('should set start, end and handler', function (done) {
        var args = test(start, end, handler)

        assert.equal(args.length, 3)
        assert.deepEqual(args[0], start)
        assert.deepEqual(args[1], end)
        assert.deepEqual(args[2], handler)

        done()
      })
    })
  })
})