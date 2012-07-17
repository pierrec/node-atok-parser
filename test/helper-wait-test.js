/*
 * wait Helper tests
 */
var assert = require('assert')

var atokParser = require('..')

describe('helpers.wait()', function () {
  describe('with false', function () {
      function myParser () {
        atok.wait(false)
      }
      var Parser = atokParser.createParser(myParser, 'options')
      var p = new Parser

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

  describe('with a single pattern', function () {
    describe('==1', function () {
      function _Parser (handler) {
        atok.wait(1, handler)
      }

      var Parser = atokParser.createParser(_Parser)

      it('should call the handler', function (done) {
        function handler (token, idx, type) {
          done()
        }

        var p = new Parser(handler)

        p.write('_')
      })
    })

    describe('>1', function () {
      function _Parser (handler) {
        atok.wait(3, handler)
      }

      var Parser = atokParser.createParser(_Parser)

      it('should call the handler', function (done) {
        function handler (token, idx, type) {
          done()
        }

        var p = new Parser(handler)

        p.write('_')
        p.write('_')
        p.write('_')
      })
    })

    describe('len==1', function () {
      function _Parser (handler) {
        atok.wait('_', handler)
      }

      var Parser = atokParser.createParser(_Parser)

      it('should call the handler', function (done) {
        function handler (token, idx, type) {
          done()
        }

        var p = new Parser(handler)

        p.write('_')
      })
    })

    describe('len>1', function () {
      function _Parser (handler) {
        atok.wait('___', handler)
        atok.addRule(1, function () {
          require('assert')()
        })
      }

      var Parser = atokParser.createParser(_Parser)

      it('should call the handler', function (done) {
        function handler (token, idx, type) {
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

  describe('with many patterns and empty first pattern', function () {
    describe('single write', function () {
      function _Parser (handler) {
        atok.wait('', '_', handler)
      }

      var Parser = atokParser.createParser(_Parser)

      it('should call the handler', function (done) {
        function handler (token, idx, type) {
          assert.equal(token, 'a')
          done()
        }

        var p = new Parser(handler)

        p.write('a_')
      })
    })

    describe('split write', function () {
      function _Parser (handler) {
        atok.wait('', '_', handler)
      }

      var Parser = atokParser.createParser(_Parser)

      it('should call the handler', function (done) {
        function handler (token, idx, type) {
          assert.equal(token, 'a')
          done()
        }

        var p = new Parser(handler)

        p.write('a')
        p.write('_')
      })
    })
  })

  describe('with many patterns', function () {
    describe('first ==1', function () {
      function _Parser (handler) {
        atok.wait(1, '_', handler)
      }

      var Parser = atokParser.createParser(_Parser)

      it('should call the handler', function (done) {
        function handler (token, idx, type) {
            done()
        }

        var p = new Parser(handler)

        p.write('_a_')
      })
    })

    describe('first =={start,end}', function () {
      function _Parser (handler) {
        atok.wait({start:'_', end:'_'}, '_', handler)
      }

      var Parser = atokParser.createParser(_Parser)

      it('should call the handler', function (done) {
        function handler (token, idx, type) {
            done()
        }

        var p = new Parser(handler)

        p.write('_a_')
      })
    })

    describe('first len==1', function () {
      function _Parser (handler) {
        atok.wait('_', '_', handler)
      }

      var Parser = atokParser.createParser(_Parser)

      it('should call the handler', function (done) {
        function handler (token, idx, type) {
            done()
        }

        var p = new Parser(handler)

        p.write('_a_')
      })
    })

    describe('first ==1 and no match', function () {
      function _Parser (handler) {
        atok.wait(1, '_', handler)
      }

      var Parser = atokParser.createParser(_Parser)

      it('should not call the handler', function (done) {
        function handler (token, idx, type) {
            done(new Error('Should not trigger'))
        }

        var p = new Parser(handler)

        p.write('~a~')
        done()
      })
    })

    describe('first =={start,end} and no match', function () {
      function _Parser (handler) {
        atok.wait({start:'_', end:'_'}, '_', handler)
      }

      var Parser = atokParser.createParser(_Parser)

      it('should not call the handler', function (done) {
        function handler (token, idx, type) {
            done(new Error('Should not trigger'))
        }

        var p = new Parser(handler)

        p.write('~a~')
        done()
      })
    })

    describe('first len==1 and no match', function () {
      function _Parser (handler) {
        atok.wait('_', '_', handler)
      }

      var Parser = atokParser.createParser(_Parser)

      it('should not call the handler', function (done) {
        function handler (token, idx, type) {
            done(new Error('Should not trigger'))
        }

        var p = new Parser(handler)

        p.write('~a~')
        done()
      })
    })

    describe('first len==1 and split write', function () {
      function _Parser (handler) {
        atok.wait('_', '_', handler)
      }

      var Parser = atokParser.createParser(_Parser)

      it('should call the handler', function (done) {
        function handler (token, idx, type) {
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

    describe('first =={start,end} and split write', function () {
      function _Parser (handler) {
        atok.wait({start: '_', end: '_'}, '_', handler)
      }

      var Parser = atokParser.createParser(_Parser)

      it('should call the handler', function (done) {
        function handler (token, idx, type) {
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
        function handler (token, idx, type) {
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

    describe('first >1', function () {
      function _Parser (handler) {
        atok.wait(3, '_', handler)
      }

      var Parser = atokParser.createParser(_Parser)

      it('should call the handler', function (done) {
        function handler (token, idx, type) {
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

    describe('first len>1 #1', function () {
      function _Parser (handler) {
        atok.wait('__', '__', handler)
      }

      var Parser = atokParser.createParser(_Parser)

      it('should call the handler', function (done) {
        function handler (token, idx, type) {
          assert(i === 2)
          done()
        }
        
        var p = new Parser(handler)
        var i = 0

        p.write('__')
        i++
        p.write('a')
        i++
        p.write('__')
      })
    })

    describe('first len>1 #2', function () {
      function _Parser (handler) {
        atok.wait('__', '__', handler)
      }

      var Parser = atokParser.createParser(_Parser)

      it('should call the handler', function (done) {
        function handler (token, idx, type) {
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