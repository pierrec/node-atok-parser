// Core modules
var fs = require('fs')
var path = require('path')
var Stream = require('stream').Stream
var vm = require('vm')
var isArray = require('util').isArray

// Modules
var debug = require('debug')('atok-parser')
var EV = require('ev')
var inherits = require('inherits')
var _eval = require('eval')
var Atok = require('atok')
var fnutils = require('fnutils')

// Local files
var Helpers = require('./helpers')
var Tracker = require('./tracker')

debug("atok version %s", Atok.version)

// Copy properties from one object to another - not replacing if required
function merge (a, b, soft) {
  for (var k in b)
    if (!soft || !a.hasOwnProperty(k)) a[k] = b[k]
  return a
}

// Show special characters for display
function inspect (s) {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/\t/g, '\\t')
    .replace(/"/g, '\\"')
    .replace(/\r/g, '\\r')
}

merge(Atok.prototype, Helpers)
exports.Helpers = Helpers

// Expose the Atok module for addition of custom helpers
exports.Atok = Atok

// Export version
exports.version = require('../package.json').version

/**
 * createParser(data, parserOptions, parserEvents, atokOptions)
 * - data (String | Array): parser javascript code
 * - parserOptions (String): list of the parser named events with their arguments count
 * - parserEvents (Object): events emitted by the parser with
 * - atokOptions (Object): tokenizer options
 *
 * Return a parser class (Function) based on the input file.
 * The following variables are made available to the parser js:
 * - atok (Object): atok tokenizer instanciated with provided options. Also 
 *   set as this.atok *DO NOT DELETE*
 * - self (Object): reference to this
 * Predefined methods:
 * - write
 * - end
 * - pause
 * - resume
 * - track
 * Events automatically forwarded from tokenizer to parser:
 * - drain
 * - debug
 */
exports.createParser = function (data, parserOptions, parserEvents, atokOptions, filename) {
  filename = filename || ''
  // Merge the supplied events with Atok's (overwrite)
  var _parserEvents = merge(parserEvents || {}, Atok.events)

  // Set an event arguments list
  function forwardEvent (event) {
    var n = Atok.events[event]
      , args = []

    while (n > 0) args.push('a' + n--)
    args = args.join()

    return 'atok.on("'
      + event
      + '", function forwardEvent (' + args + ') { self.emit_' + event + '(' + args + ') })'
  }

  // Set the parser options
  parserOptions = parserOptions || (typeof data === 'function' ? fnutils.head(data) : '')

  // Set the constructor name
  var cname = typeof data === 'function' && data.name ? data.name : 'Parser'

  // Define the parser constructor
  var content = []
  content.push(
    'function ' + cname + ' (' + parserOptions + ') {'
  , 'if (!(this instanceof ' + cname + ')) {'
  , 'return new ' + cname + '(' + parserOptions + ') }'
  , 'EV.call(this, ' + JSON.stringify(_parserEvents) + ')'
  , 'this.readable = true'
  , 'this.writable = true'
  , 'this.debugMode = false'
  , 'var self = this'
  , 'var atok = new Atok(' + (atokOptions ? JSON.stringify(atokOptions): '') + ')'
  , forwardEvent('drain')
  , forwardEvent('debug')
  , 'this.atok = atok'
  , 'var atokTracker = new Tracker(atok)'
  , 'this.atokTracker = atokTracker'
  , 'function error (err, data) {'
  , 'atok.pause()'
  , 'return self.trackError(err, data)'
  , '}'
  , isArray(data)
      ? data.join(';')
      : typeof data === 'function'
          ? fnutils.body(data)
          : data
  , '}'
  , 'inherits(' + cname + ', EV, Stream.prototype)'
  , 'module.exports = ' + cname
  , ''
  )

  var Parser = _eval(
    content.join(';')
  , filename
  , {
      __filename: filename
    , __dirname: path.dirname(filename)
    // Custom exposed globals
    , Atok: Atok
    , Tracker: Tracker
    , EV: EV
    , Stream: Stream
    , inherits: inherits
    }
  )

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
    this.atok.end(data)
    return this
  }
  Parser.prototype.destroy = function () {}

  // Proxy some tokenizer methods
  Parser.prototype.setEncoding = function () {
    this.atok.setEncoding( arguments[0] )
    return this
  }

  // Debug
  Parser.prototype.debug = function (flag) {
    var _debug = !!flag

    // Nothing to do if already in same mode
    if (_debug === this.debugMode) return this

    this.atok.debug(_debug)
    if (typeof flag === 'function') this.on('debug', flag)

    return this
  }

  // Track current line and column
  // type: {Boolean}
  Parser.prototype.track = function (flag) {
    this.atokTracker[ flag === true ? 'start' : 'stop' ]()

    return this
  }
  // Build error message based on the current position in the buffer
  Parser.prototype.trackError = function (err, data, delta) {
    err = err || new Error
    data = data || ''
    delta = typeof delta === 'number' ? delta : 10

    var atok = this.atok
    var size = data.length
    var pos = atok.offset

    var tracker = this.atokTracker

    var msg = 'rule: ' + atok.currentRule()

    if (tracker.running) {
      var margin = 4

      var line = tracker.y
      var column = tracker.x + 1

      // Extract some data from the current position: some left, some right
      var left = Math.max(0, pos - delta)
      var leftExtract = atok.slice(left, pos)
      var leftInspected = inspect(leftExtract)
      
      var right = Math.min(atok.length, pos + delta)
      var rightExtract = atok.slice(pos, right)
      var rightInspected = inspect(rightExtract)

      // Position of the cursor below the displayed data
      var cursor = pos - left + margin + leftInspected.length - leftExtract.length

      msg += ', line: '
      msg += line
      msg += ', column: '
      msg += column
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
      msg += ', token: '
      msg += inspect( data )
    }
    msg += '\n'

    err.message += err.message.length ? ', ' + msg : msg
    return merge(err, {
      line: line
    , column: column
    , token: data
    , rule: atok.currentRule()
    })
  }

  return Parser
}

/**
 * createParserFromFile(file, parserOptions, parserEvents, atokOptions)
 * - file (String): file to read the parser from(.js extension is optional but enforced)
 * - parserOptions (String): list of the parser named events with their arguments count
 * - parserEvents (Object): events emitted by the parser with
 * - atokOptions (Object): tokenizer options
 */
exports.createParserFromFile = function (file, parserOptions, parserEvents, atokOptions) {
  // Append .js extension if not set
  var filename = file.slice(-3) === '.js' ? file : file + '.js'
  // Figure out the file full path
  filename = path.resolve( path.dirname(module.parent.filename), filename )

  return exports
    .createParser(
      fs.readFileSync(filename).toString()
    , parserOptions
    , parserEvents
    , atokOptions
    , filename
    )
}
