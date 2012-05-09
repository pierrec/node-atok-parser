/*
 * Parser Helpers tests
**/
var assert = require('assert')

var atokParser = require('..')
var options = {}

describe('Parser Helpers', function () {
  describe('helpers.float()', function () {
    describe('with a full float as a positive integer', function () {
      var Parser = atokParser.createParser('./parsers/floatHelperParser.js', 'options')
      var p = new Parser(options)

      it('should parse it', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'float':
              assert.equal(token, 123)
              done()
            break
            default:
              done( new Error('Unknown type: ' + type) )
          }
        }

        p.on('error', done)
        p.on('data', handler)
        p.write('123 ')
      })
    })

    describe('with a full float as a negative integer', function () {
      var Parser = atokParser.createParser('./parsers/floatHelperParser.js', 'options')
      var p = new Parser(options)

      it('should parse it', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'float':
              assert.equal(token, -123)
              done()
            break
            default:
              done( new Error('Unknown type: ' + type) )
          }
        }

        p.on('error', done)
        p.on('data', handler)
        p.write('-123 ')
      })
    })

    describe('with a full float as a positive float', function () {
      var Parser = atokParser.createParser('./parsers/floatHelperParser.js', 'options')
      var p = new Parser(options)

      it('should parse it', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'float':
              assert.equal(token, 123.456)
              done()
            break
            default:
              done( new Error('Unknown type: ' + type) )
          }
        }

        p.on('error', done)
        p.on('data', handler)
        p.write('123.456 ')
      })
    })

    describe('with a full float as a negative float', function () {
      var Parser = atokParser.createParser('./parsers/floatHelperParser.js', 'options')
      var p = new Parser(options)

      it('should parse it', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'float':
              assert.equal(token, -123.456)
              done()
            break
            default:
              done( new Error('Unknown type: ' + type) )
          }
        }

        p.on('error', done)
        p.on('data', handler)
        p.write('-123.456 ')
      })
    })

    describe('with a full float as a positive float with exponent', function () {
      var Parser = atokParser.createParser('./parsers/floatHelperParser.js', 'options')
      var p = new Parser(options)

      it('should parse it', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'float':
              assert.equal(token, 123.456e7)
              done()
            break
            default:
              done( new Error('Unknown type: ' + type) )
          }
        }

        p.on('error', done)
        p.on('data', handler)
        p.write('123.456e7 ')
      })
    })

    describe('with a full float as a negative float with exponent', function () {
      var Parser = atokParser.createParser('./parsers/floatHelperParser.js', 'options')
      var p = new Parser(options)

      it('should parse it', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'float':
              assert.equal(token, -123.456e7)
              done()
            break
            default:
              done( new Error('Unknown type: ' + type) )
          }
        }

        p.on('error', done)
        p.on('data', handler)
        p.write('-123.456e7 ')
      })
    })

    describe('with an integer with exponent', function () {
      var Parser = atokParser.createParser('./parsers/floatHelperParser.js', 'options')
      var p = new Parser(options)

      it('should parse it', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'float':
              assert.equal(token, 123e7)
              done()
            break
            default:
              done( new Error('Unknown type: ' + type) )
          }
        }

        p.on('error', done)
        p.on('data', handler)
        p.write('123e7 ')
      })
    })

    describe('with a negative integer with exponent', function () {
      var Parser = atokParser.createParser('./parsers/floatHelperParser.js', 'options')
      var p = new Parser(options)

      it('should parse it', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'float':
              assert.equal(token, -123e7)
              done()
            break
            default:
              done( new Error('Unknown type: ' + type) )
          }
        }

        p.on('error', done)
        p.on('data', handler)
        p.write('-123e7 ')
      })
    })

    describe('with a float with a negative exponent', function () {
      var Parser = atokParser.createParser('./parsers/floatHelperParser.js', 'options')
      var p = new Parser(options)

      it('should parse it', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'float':
              assert.equal(token, 123e-7)
              done()
            break
            default:
              done( new Error('Unknown type: ' + type) )
          }
        }

        p.on('error', done)
        p.on('data', handler)
        p.write('123e-7 ')
      })
    })

    describe('with a float with a positive exponent', function () {
      var Parser = atokParser.createParser('./parsers/floatHelperParser.js', 'options')
      var p = new Parser(options)

      it('should parse it', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'float':
              assert.equal(token, 123e7)
              done()
            break
            default:
              done( new Error('Unknown type: ' + type) )
          }
        }

        p.on('error', done)
        p.on('data', handler)
        p.write('123e+7 ')
      })
    })

    describe('with a split up float', function () {
      var Parser = atokParser.createParser('./parsers/floatHelperParser.js', 'options')
      var p = new Parser(options)

      it('should parse it', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'float':
              assert.equal(token, 123.456)
            break
            default:
              done( new Error('Unknown type: ' + type) )
          }
        }

        p.on('error', done)
        p.on('data', handler)
        p.write('123')
        assert.equal(p.atok.length, 0)
        p.write('.456 ')
        done()
      })
    })

    describe('with a split up float 2', function () {
      var Parser = atokParser.createParser('./parsers/floatHelperParser.js', 'options')
      var p = new Parser(options)

      it('should parse it', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'float':
              assert.equal(token, 123.456)
            break
            default:
              done( new Error('Unknown type: ' + type) )
          }
        }

        p.on('error', done)
        p.on('data', handler)
        p.write('123.')
        assert.equal(p.atok.length, 0)
        p.write('456 ')
        done()
      })
    })

    describe('with a split up float 3', function () {
      var Parser = atokParser.createParser('./parsers/floatHelperParser.js', 'options')
      var p = new Parser(options)

      it('should parse it', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'float':
              assert.equal(token, 123.456e7)
            break
            default:
              done( new Error('Unknown type: ' + type) )
          }
        }

        p.on('error', done)
        p.on('data', handler)
        p.write('123.')
        assert.equal(p.atok.length, 0)
        p.write('456')
        assert.equal(p.atok.length, 0)
        p.write('e7 ')
        done()
      })
    })

    describe('with a split up float 4', function () {
      var Parser = atokParser.createParser('./parsers/floatHelperParser.js', 'options')
      var p = new Parser(options)

      it('should parse it', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'float':
              assert.equal(token, 123.456e7)
            break
            default:
              done( new Error('Unknown type: ' + type) )
          }
        }

        p.on('error', done)
        p.on('data', handler)
        p.write('123.')
        assert.equal(p.atok.length, 0)
        p.write('456e')
        assert.equal(p.atok.length, 0)
        p.write('7 ')
        done()
      })
    })

    describe('with a split up float 5', function () {
      var Parser = atokParser.createParser('./parsers/floatHelperParser.js', 'options')
      var p = new Parser(options)

      it('should parse it', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'float':
              assert.equal(token, 123.456e17)
            break
            default:
              done( new Error('Unknown type: ' + type) )
          }
        }

        p.on('error', done)
        p.on('data', handler)
        p.write('123.')
        assert.equal(p.atok.length, 0)
        p.write('456e1')
        assert.equal(p.atok.length, 0)
        p.write('7 ')
        done()
      })
    })

    describe('with a non ending number', function () {
      var Parser = atokParser.createParser('./parsers/floatHelperParser.js', 'options')
      var p = new Parser(options)
      
      it('should not parse it', function (done) {
        var res

        function handler (token, idx, type) {
          switch (type) {
            case 'float':
              assert.equal(token, '123')
              res = token
            break
            default:
              done( new Error('Unknown type: ' + type) )
          }
        }

        p.on('error', done)
        p.on('data', handler)
        p.write('123')
        assert.equal(res, undefined)
        done()
      })
    })
  })
})