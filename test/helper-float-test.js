/*
 * Parser Helpers tests
**/
var assert = require('assert')

var atokParser = require('..')
var options = {}

describe('Parser Helpers', function () {
  describe('helpers.float()', function () {
    describe('with false', function () {
      function myParser () {
        atok.float(false)
      }
      var Parser = atokParser.createParser(myParser, 'options')
      var p = new Parser(options)

      it('should ignore it', function (done) {
        function handler (token, idx, type) {
          done( new Error('Should not trigger') )
        }

        p.on('error', done)
        p.on('data', handler)
        p.write('1.2 ')
        done()
      })
    })

    describe('with an invalid float #1', function () {
      var Parser = atokParser.createParserFromFile('./parsers/float2HelperParser.js', 'options')
      var p = new Parser(options), err

      it('should fail and move to the next rule', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'data':
              assert.equal(p.atok.offset, 0)
              done()
            break
            default:
              done( new Error('handler should not be called') )
          }
        }

        p.on('data', handler)
        p.write('- ')
      })
    })

    describe('with an invalid float #2', function () {
      var Parser = atokParser.createParserFromFile('./parsers/float2HelperParser.js', 'options')
      var p = new Parser(options), err

      it('should fail and move to the next rule', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'data':
            break
            default:
              err = new Error('handler should not be called')
          }
        }

        p.on('data', handler)
        p.write('-. ')
        done(err)
      })
    })

    describe('with an invalid float #3', function () {
      var Parser = atokParser.createParserFromFile('./parsers/float3HelperParser.js', 'options')
      var p = new Parser(options), err

      it('should fail and move to the next rule', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'data':
              assert.equal(p.atok.offset, 0)
            break
            default:
              err = new Error('handler should not be called')
          }
        }

        p.on('data', handler)
        p.write('- ')
        done(err)
      })
    })

    describe('with a full float as a positive integer', function () {
      var Parser = atokParser.createParserFromFile('./parsers/floatHelperParser.js', 'options')
      var p = new Parser(options), err

      it('should parse it', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'float':
              assert.equal(typeof token, 'number')
              assert.equal(token, 123)
            break
            default:
              err = new Error('Unknown type: ' + type)
          }
        }

        p.on('data', handler)
        p.write('123 ')
        done(err)
      })
    })

    describe('with a full float as a negative integer', function () {
      var Parser = atokParser.createParserFromFile('./parsers/floatHelperParser.js', 'options')
      var p = new Parser(options), err

      it('should parse it', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'float':
              assert.equal(typeof token, 'number')
              assert.equal(token, -123)
            break
            default:
              err = new Error('Unknown type: ' + type)
          }
        }

        p.on('data', handler)
        p.write('-123 ')
        done(err)
      })
    })

    describe('with a full float as a positive float', function () {
      var Parser = atokParser.createParserFromFile('./parsers/floatHelperParser.js', 'options')
      var p = new Parser(options), err

      it('should parse it', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'float':
              assert.equal(typeof token, 'number')
              assert.equal(token, 123.456)
            break
            default:
              err = new Error('Unknown type: ' + type)
          }
        }

        p.on('data', handler)
        p.write('123.456 ')
        done(err)
      })
    })

    describe('with a full float as a negative float', function () {
      var Parser = atokParser.createParserFromFile('./parsers/floatHelperParser.js', 'options')
      var p = new Parser(options), err

      it('should parse it', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'float':
              assert.equal(typeof token, 'number')
              assert.equal(token, -123.456)
            break
            default:
              err = new Error('Unknown type: ' + type)
          }
        }

        p.on('data', handler)
        p.write('-123.456 ')
        done(err)
      })
    })

    describe('with a full float as a positive float with exponent', function () {
      var Parser = atokParser.createParserFromFile('./parsers/floatHelperParser.js', 'options')
      var p = new Parser(options), err

      it('should parse it', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'float':
              assert.equal(typeof token, 'number')
              assert.equal(token, 123.456e7)
            break
            default:
              err = new Error('Unknown type: ' + type)
          }
        }

        p.on('data', handler)
        p.write('123.456e7 ')
        done(err)
      })
    })

    describe('with a full float as a negative float with exponent', function () {
      var Parser = atokParser.createParserFromFile('./parsers/floatHelperParser.js', 'options')
      var p = new Parser(options), err

      it('should parse it', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'float':
              assert.equal(typeof token, 'number')
              assert.equal(token, -123.456e7)
            break
            default:
              err = new Error('Unknown type: ' + type)
          }
        }

        p.on('data', handler)
        p.write('-123.456e7 ')
        done(err)
      })
    })

    describe('with an integer with exponent', function () {
      var Parser = atokParser.createParserFromFile('./parsers/floatHelperParser.js', 'options')
      var p = new Parser(options), err

      it('should parse it', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'float':
              assert.equal(typeof token, 'number')
              assert.equal(token, 123e7)
            break
            default:
              err = new Error('Unknown type: ' + type)
          }
        }

        p.on('data', handler)
        p.write('123e7 ')
        done(err)
      })
    })

    describe('with a negative integer with exponent', function () {
      var Parser = atokParser.createParserFromFile('./parsers/floatHelperParser.js', 'options')
      var p = new Parser(options), err

      it('should parse it', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'float':
              assert.equal(typeof token, 'number')
              assert.equal(token, -123e7)
            break
            default:
              err = new Error('Unknown type: ' + type)
          }
        }

        p.on('data', handler)
        p.write('-123e7 ')
        done(err)
      })
    })

    describe('with a float with a negative exponent', function () {
      var Parser = atokParser.createParserFromFile('./parsers/floatHelperParser.js', 'options')
      var p = new Parser(options), err

      it('should parse it', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'float':
              assert.equal(typeof token, 'number')
              assert.equal(token, 123e-7)
            break
            default:
              err = new Error('Unknown type: ' + type)
          }
        }

        p.on('data', handler)
        p.write('123e-7 ')
        done(err)
      })
    })

    describe('with a float with a positive exponent', function () {
      var Parser = atokParser.createParserFromFile('./parsers/floatHelperParser.js', 'options')
      var p = new Parser(options), err

      it('should parse it', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'float':
              assert.equal(typeof token, 'number')
              assert.equal(token, 123e7)
            break
            default:
              err = new Error('Unknown type: ' + type)
          }
        }

        p.on('data', handler)
        p.write('123e+7 ')
        done(err)
      })
    })

    describe('with a split up float', function () {
      var Parser = atokParser.createParserFromFile('./parsers/floatHelperParser.js', 'options')
      var p = new Parser(options), err

      it('should parse it', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'float':
              assert.equal(typeof token, 'number')
              assert.equal(token, 123.456)
            break
            default:
              err = new Error('Unknown type: ' + type)
          }
        }

        p.on('data', handler)
        p.write('123')
        p.write('.456 ')
        done()
      })
    })

    describe('with a split up float 2', function () {
      var Parser = atokParser.createParserFromFile('./parsers/floatHelperParser.js', 'options')
      var p = new Parser(options), err

      it('should parse it', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'float':
              assert.equal(typeof token, 'number')
              assert.equal(token, 123.456)
            break
            default:
              err = new Error('Unknown type: ' + type)
          }
        }

        p.on('data', handler)
        p.write('123.')
        p.write('456 ')
        done()
      })
    })

    describe('with a split up float 3', function () {
      var Parser = atokParser.createParserFromFile('./parsers/floatHelperParser.js', 'options')
      var p = new Parser(options), err

      it('should parse it', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'float':
              assert.equal(typeof token, 'number')
              assert.equal(token, 123.456e7)
            break
            default:
              err = new Error('Unknown type: ' + type)
          }
        }

        p.on('data', handler)
        p.write('123.')
        p.write('456')
        p.write('e7 ')
        done()
      })
    })

    describe('with a split up float 4', function () {
      var Parser = atokParser.createParserFromFile('./parsers/floatHelperParser.js', 'options')
      var p = new Parser(options), err

      it('should parse it', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'float':
              assert.equal(typeof token, 'number')
              assert.equal(token, 123.456e7)
            break
            default:
              err = new Error('Unknown type: ' + type)
          }
        }

        p.on('data', handler)
        p.write('123.')
        p.write('456e')
        p.write('7 ')
        done()
      })
    })

    describe('with a split up float 5', function () {
      var Parser = atokParser.createParserFromFile('./parsers/floatHelperParser.js', 'options')
      var p = new Parser(options), err

      it('should parse it', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'float':
              assert.equal(typeof token, 'number')
              assert.equal(token, 123.456e17)
            break
            default:
              err = new Error('Unknown type: ' + type)
          }
        }

        p.on('data', handler)
        p.write('123.')
        p.write('456e1')
        p.write('7 ')
        done()
      })
    })

    describe('with a split up float 6', function () {
      var Parser = atokParser.createParserFromFile('./parsers/floatHelperParser.js', 'options')
      var p = new Parser(options), err

      it('should parse it', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'float':
              assert.equal(typeof token, 'number')
              assert.equal(token, 123.456)
            break
            default:
              err = new Error('Unknown type: ' + type)
          }
        }

        p.on('data', handler)
        p.write('123.456')
        p.write('.7 ')
        done()
      })
    })

    describe('with a split up float 7', function () {
      var Parser = atokParser.createParserFromFile('./parsers/floatHelperParser.js', 'options')
      var p = new Parser(options), err

      it('should parse it', function (done) {
        function handler (token, idx, type) {
          switch (type) {
            case 'float':
              assert.equal(typeof token, 'number')
              assert.equal(token, -123.456)
            break
            default:
              err = new Error('Unknown type: ' + type)
          }
        }

        p.on('data', handler)
        p.write('-')
        p.write('123.456')
        p.end()
        done()
      })
    })

    describe('with a non ending number', function () {
      var Parser = atokParser.createParserFromFile('./parsers/floatHelperParser.js', 'options')
      var p = new Parser(options), err
      
      it('should not parse it', function (done) {
        var res

        function handler (token, idx, type) {
          switch (type) {
            case 'float':
              assert.equal(typeof token, 'number')
              assert.equal(token, '123')
              res = token
            break
            default:
              err = new Error('Unknown type: ' + type)
          }
        }

        p.on('data', handler)
        p.write('123')
        assert.equal(res, undefined)
        done()
      })
    })

    describe('with an ending number', function () {
      var Parser = atokParser.createParserFromFile('./parsers/floatHelperParser.js', 'options')
      var p = new Parser(options), err
      
      it('should not parse it', function (done) {
        var res

        function handler (token, idx, type) {
          switch (type) {
            case 'float':
              assert.equal(typeof token, 'number')
              assert.equal(token, '123')
              res = token
            break
            default:
              err = new Error('Unknown type: ' + type)
          }
        }

        p.on('data', handler)
        p.end('123')
        done()
      })
    })
  })
})