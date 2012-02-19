/*
 * Parser `track()` tests
**/
var assert = require('assert')

var atokParser = require('..')
var options = {}

describe('Parser', function () {
  describe('a new Parser sets the error positioning', function () {
    var Parser = atokParser.createParser('./parsers/dummyParser.js', 'options')

    describe('with no token supplied, at 1,1', function () {
      var p = new Parser(options).track(true)

      it('should get 1,1', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'error':
              var err = p.trackError(new Error('test'), null, 3)
              assert.equal(err.line, 1)
              assert.equal(err.column, 1)
              done()
            break
          }
        }

        p.on('data', handler)
        p.write('~')
      })
    })

    describe('with a token supplied at 1,1', function () {
      var p = new Parser(options).track(true)

      it('should get 1,1', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'error':
              var err = p.trackError(new Error('test'), token, 3)
              assert.equal(err.line, 1)
              assert.equal(err.column, 1)
              done()
            break
          }
        }

        p.on('data', handler)
        p.write('~')
      })
    })

    describe('with a token supplied at 2,1', function () {
      var p = new Parser(options).track(true)

      it('should get 2,1', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'error':
              var err = p.trackError(new Error('test'), token, 3)
              assert.equal(err.line, 1)
              assert.equal(err.column, 2)
              done()
            break
          }
        }

        p.on('data', handler)
        p.write('a~')
      })
    })

    describe('with a token supplied at 1,2', function () {
      var p = new Parser(options).track(true)

      it('should get 1,2', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'error':
              var err = p.trackError(new Error('test'), token, 3)
              assert.equal(err.line, 2)
              assert.equal(err.column, 1)
              done()
            break
          }
        }

        p.on('data', handler)
        p.write('a\n~')
      })
    })

    describe('with a token supplied at 2,2', function () {
      var p = new Parser(options).track(true)

      it('should get 2,2', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'error':
              var err = p.trackError(new Error('test'), token, 3)
              assert.equal(err.line, 2)
              assert.equal(err.column, 2)
              done()
            break
          }
        }

        p.on('data', handler)
        p.write('a\nb~')
      })
    })
  })

  describe('a new Parser sets the error positioning with multiple writes', function () {
    var Parser = atokParser.createParser('./parsers/dummyParser.js', 'options')

    describe('with a token supplied at 2,1', function () {
      var p = new Parser(options).track(true)

      it('should get 2,1', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'error':
              var err = p.trackError(new Error('test'), token, 3)
              assert.equal(err.line, 1)
              assert.equal(err.column, 2)
              done()
            break
          }
        }

        p.on('data', handler)
        p.write('a')
        p.write('~')
      })
    })

    describe('with a token supplied at 1,2', function () {
      var p = new Parser(options).track(true)

      it('should get 1,2', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'error':
              var err = p.trackError(new Error('test'), token, 3)
              assert.equal(err.line, 2)
              assert.equal(err.column, 1)
              done()
            break
          }
        }

        p.on('data', handler)
        p.write('a')
        p.write('\n~')
      })
    })

    describe('with a token supplied at 2,2', function () {
      var p = new Parser(options).track(true)

      it('should get 2,2', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'error':
              var err = p.trackError(new Error('test'), token, 3)
              assert.equal(err.line, 2)
              assert.equal(err.column, 2)
              done()
            break
          }
        }

        p.on('data', handler)
        p.write('a\n')
        p.write('b~')
      })
    })
  })
})