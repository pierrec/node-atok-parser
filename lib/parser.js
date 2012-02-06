var fs = require('fs')
var path = require('path')
var Stream = require('stream').Stream
var vm = require('vm')

var inherits = require('inherits')
var requireLike = require('require-like')
var Atok = require('atok')
var Helpers = require('./helpers')
var Tracker = require('./tracker')

function noOp () {}

function merge (a, b, soft) {
  for (var k in b)
    if (!soft || !a.hasOwnProperty(k)) a[k] = b[k]
  return a
}

function inspect (s) {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/\t/g, '\\t')
    .replace(/"/g, '\\"')
    .replace(/\r/g, '\\r')
}


/**
 * createParser(file, parserOptions, atokOptions)
 * - file (String): file to read the parser from(.js extension is optional)
 * - parserOptions (String): list of named arguments supplied to the parser
 * - atokOptions (Object): tokenizer options
 *
 * Return a parser class (Function) based on the input file.
 * The following variables are made available to the parser js:
 * - atok {Object}: atok tokenizer instanciated with provided options. Also 
 *   set as this.atok *DO NOT DELETE*
 * - self (Object): reference to this
 * Predefined methods:
 * - write
 * - end
 * - pause
 * - resume
 * - track
**/
exports.createParser = function (file, parserOptions, atokOptions, parserModule) {
  var filename = file.slice(-3) === '.js' ? file : file + '.js'
  filename = path.resolve( path.dirname(module.parent.filename), filename )

  var content = []
  content.push(
    'function Parser (' + (parserOptions || '') + ') {'
  , 'if (!(this instanceof Parser)) {'
  , 'return new Parser(' + (parserOptions || '') + ') }'
  , 'Stream.call(this)'
  , 'this.readable = true'
  , 'this.writable = true'
  , 'var self = this'
  , 'var atok = new Atok(' + (atokOptions ? JSON.stringify(atokOptions): '') + ')'
  , 'this.atok = atok'
  , 'this.atokTracker = new Tracker(atok)'
  , fs.readFileSync(filename).toString()
  , '}'
  , 'inherits(Parser, Stream)'
  , 'exports = Parser'
  , ''
  )

  // Expose standard Node globals + atok specifics
  var exports = {}
  var sandbox = {
    exports: exports
  , module: { exports: exports }
  , require: requireLike(module.parent.filename)
  , __filename: filename
  , __dirname: path.dirname(filename)
  // Custom exposed globals
  , Atok: Atok
  , Tracker: Tracker
  , Stream: Stream
  , inherits: inherits
  }
  sandbox.global = sandbox
  // Make the global properties available to the parser
  merge(sandbox, global)

  // Build the parser constructor
  vm.createScript(content.join(';'), filename)
    .runInNewContext(sandbox)

  var Parser = sandbox.exports

  // Apply the parser stream methods to the tokenizer
  Parser.prototype.pause = function () {
    this.atok.pause()
    return this
  }
  Parser.prototype.resume = function () {
    this.atok.resume()
    return this
  }
  Parser.prototype.write = function (data) {
    return this.atok.write(data)
  }
  Parser.prototype.end = function (data) {
    return this.atok.end(data)
  }
  Parser.prototype.destroy = noOp
  // Track current line and column
  // type: {String | Boolean} platform type
  Parser.prototype.track = function (type) {
    if (type) { // Turn tracking ON
      this.atokTracker.start(type)
    } else { // Turn tracking OFF
      this.atokTracker.end()
    }

    return this
  }
  // Add helpers
  Parser.prototype.helpers = Helpers
  // Build error message based on the current position in the buffer
  Parser.prototype.trackError = function (err, data, delta) {
    err = err || { message: '' }
    data = data || ''
    delta = typeof delta === 'number' ? delta : 10

    var atok = this.atok
    var size = data.length
    var pos = atok.offset - size

    var tracker = this.atokTracker

    var msg = ''
    msg += 'rule: ' + atok.getRuleSet()

    if (tracker.running) {
      var margin = 4

      var line = tracker.y
      // var column = atok.bytesRead - tracker.x + 1
      var column = tracker.x + 1

      // Extract some data from the current position: some left, some right
      var left = Math.max(0, pos - delta)
      var leftExtract = atok._slice(left, pos)
      var leftInspected = inspect(leftExtract)
      
      var right = Math.min(atok.length, pos + delta)
      var rightExtract = atok._slice(pos, right)
      var rightInspected = inspect(rightExtract)

      // Position of the cursor below the displayed data
      var cursor = pos - left + margin + leftInspected.length - leftExtract.length

      msg += ', line: ' + line
      msg += ', column: ' + column
      msg += '\n'
      // Data sample around the current buffer position
      msg += Array(margin + 1).join(' ')
      msg += leftInspected
      msg += rightInspected
      msg += '\n'
      // Offset the cursor
      msg += Array(cursor).join(' ')
      // Add the cursor
      msg += Array((Math.min(size, right - pos) || 1) + 1).join('^')
    } else {
      msg += ', token: ' + inspect( data )
    }
    msg += '\n'

    err.message += err.message.length ? ', ' + msg : msg
    return merge(err, {
      line: line
    , column: column
    , token: data
    , rule: atok.getRuleSet()
    })
  }

  return Parser
}