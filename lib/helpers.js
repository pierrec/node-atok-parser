/*
	Best practices:
	- name the handlers according to the helper name (useful in debug mode)
 */
var isArray = require('util').isArray
var Atok = require('atok')
var sliceArguments = require('fnutils').slice

// if a handler is to be defined it *must* be a function
module.exports._helper_setArguments = function (defaults, args, type) {
	var atok = this, n = args.length

	// Ignore the rule
	if (n > 0 && args[n-1] === false) return false

	// Set the handler
	if (n === 0 || typeof args[n-1] !== 'function') {
		if (n > 0) type = args[--n]

		defaults.push(
			atok.handler || function helperDefaultHandler (token) {
				atok.emit_data(token, arguments.length > 1 ? arguments[1] : -1, type)
			}
		)
	} else {
		defaults.push( args[--n] )
	}

	var i = -1
	while (++i < n) {
		if (typeof args[i] !== 'undefined') defaults[i] = args[i]
	}

	return defaults
}

module.exports._helper_continueFailure = function (props, jumpPos, jumpNeg) {
	var cont = props.continue[1]
	return cont + (cont < 0 ? jumpNeg : jumpPos)
}
module.exports._helper_continueSuccess = function (props, jumpPos, jumpNeg) {
	var cont = props.continue[0]
	return cont === null ? null : cont + (cont < 0 ? jumpNeg : jumpPos)
}

var markedOffsetList = []
var offsetList = []
module.exports._mark = function () {
	markedOffsetList.push( this.markedOffset )
	offsetList.push(this.offset)

	return this.markedOffset = this.offset
}
module.exports._unmark = function () {
	this.markedOffset = markedOffsetList.pop()

	return offsetList.pop()
}

module.exports._helper_word = function (wordStart, handler) {
	var atok = this
	var resetMarkedOffset = false	// First helper to set the markedOffset value?
	var running = false				// Current helper running

	var props = atok.getProps()
	var isQuiet = props.quiet
	var isIgnored = props.ignore

	function _helper_start () {
		running = true
		// Prevent buffer slicing by atok
		atok._mark()
	}
	function _helper_done () {
		running = false
		var offset = atok._unmark()
		if (!isIgnored) {
			handler(
				isQuiet
					? atok.offset - offset
					: atok.slice(offset, atok.offset)
			, -1
			, null
			)
		}
	}
	function _helper_end () {
		if (running) _helper_done()
	}

	return atok
		.once('end', _helper_end)

		.groupRule(true)
		// Match / no match
		.ignore()			// The handler needs to fire
		.quiet(true)	// Data doesnt matter
		.next()				// Dont change ruleSet
		.break()			// Dont exit the loop
		.continue( 0, this._helper_continueFailure(props, 2, 0) )
			.addRule(wordStart, _helper_start)

		// while(character matches a word letter)
		.continue(-1).ignore(true)
			.addRule(wordStart, '_helper_wordCheck')

		// Word parsed, reset the properties except ignore and quiet
		.setProps(props).ignore().quiet(true)
		.continue( this._helper_continueSuccess(props, 0, 2) )
		.addRule(_helper_done)

		.setProps(props)
		.groupRule()
}

// include("helpers/chunk.js")
// List of characters members of charSet (mandatory argument)
module.exports.chunk = function (/* charSet, handler */) {
	if (arguments.length < 1)
		this.emit_error( new Error('chunk(): charSet required') )
	
	var args = this._helper_setArguments([null], arguments, 'chunk')

	return !args ? this : this._helper_word(args[0], args[1])
}
// include("helpers/float.js")
// float numbers
var floatStart = { start: '0-', end: '9-' }
module.exports.float = function (/* handler */) {
	var args = this._helper_setArguments([], arguments, 'float')

	if (!args) return this
	
	var handler = args[0]
	var result
	var startOffset

	var atok = this
	var resetMarkedOffset = false	// First helper to set the markedOffset value?
	var running = false				// Current helper running

	var props = atok.getProps()
	var isQuiet = props.quiet
	var isIgnored = props.ignore

	function float_start () {
		running = true
		// Prevent buffer slicing by atok
		resetMarkedOffset = (atok.markedOffset < 0)
		if (resetMarkedOffset) atok.markedOffset = atok.offset
		startOffset = atok.offset
	}
	function float_check () {
		result = Number( atok.slice(atok.markedOffset, atok.offset) )

		// Valid float if the value is not NaN
		if ( result === +result ) return 0

		// Invalid float (NaN)
		running = false
		if (resetMarkedOffset) atok.markedOffset = -1
		atok.offset = startOffset

		return -1
	}
	function float_done () {
		running = false
		if (!isIgnored)
			handler(
				isQuiet
					? atok.offset - atok.markedOffset
					: result
			, -1
			, null
			)

		if (resetMarkedOffset) atok.markedOffset = -1
	}
	function float_end () {
		if (running && float_check() >= 0) float_done()
	}

	if (!isIgnored)
		atok.once('end', float_end)

	return atok
		.groupRule(true)
		// Match / no match
		.ignore().quiet(true).break().next()
		.continue( 0, this._helper_continueFailure(props, 7, 0) )
			.addRule(floatStart, float_start)

		// -123.456e7
		// ^^^^
		.continue(-1).ignore(true)
			.addRule(numberStart, 'float-value1')
		// -123.456e7
		//     ^
		.continue(0, 1) // Decimal / No decimal, check exponent
			.addRule('.', 'float-dot')
		// -123.456e7
		//      ^^^
		.continue(-1)
			.addRule(numberStart, 'float-value2')
		// -123.456e7
		//         ^
		.continue(0, 2) // Exponent / No exponent
			.addRule(['e','E'], 'float-exp')
		// -123.456e-7
		//          ^
		.continue(0)
			.addRule(['-','+'], 'float-exp-sign') // Negative or positive exponent
		// -123.456e-7
		//           ^
		.continue(-1)
			.addRule(numberStart, 'float-exp-value')
		// Float parsed, reset the properties except ignore and quiet
		.setProps(props).ignore().quiet(true)
		.continue(
			this._helper_continueSuccess(props, 0, -7)
		,	this._helper_continueFailure(props, 0, -7)
		)
			// .addRule(float_check, !isQuiet && float_done)
			// .addRule(isQuiet && float_done)
			.addRule(float_check, float_done)

		// Restore all properties
		.setProps(props)
		.groupRule()
}
// include("helpers/match.js")
// match a pattern bypassing strings (double or single quote, or both) (default=both)
// ex: (a("(b")c) -> a("(b")c
module.exports.match = function (/* start, end, stringQuotes, handler */) {
	var args = this._helper_setArguments([null,null,['"',"'"]], arguments, 'match')

	if (!args) return this

	var start = args[0]
		, end = args[1]
		, stringQuotes = args[2]
		, handler = args[3]

	if (start === null || end === null)
		this.emit_error( new Error('match(): start and end required') )

	if ( !isArray(stringQuotes) )
		this.emit_error( new Error('match(): stringQuotes must be an Array') )

	var quotesNum = stringQuotes.length
	var count

	var atok = this
	var resetMarkedOffset = false	// First helper to set the markedOffset value?

	var props = atok.getProps()
	var isQuiet = props.quiet
	var isIgnored = props.ignore

	function match_start (matched) {
		count = 1
		// Prevent buffer slicing by atok
		resetMarkedOffset = (atok.markedOffset < 0)
		// Mimic trimLeft() behaviour
		if (resetMarkedOffset)
			atok.markedOffset = atok.offset + ( props.trimLeft ? matched : 0 )
	}
	function match_done (matched) {
		if (!isIgnored) {
			// Mimic trimRight() behaviour
			var offset = atok.offset + ( props.trimRight ? 0 : matched )
			handler(
				isQuiet
					? offset - atok.markedOffset
					: atok.slice(atok.markedOffset, offset)
			, -1
			, null
			)
		}
		if (resetMarkedOffset) atok.markedOffset = -1
	}
	function matchEnd () {
		return --count === 0 ? 0 : -1
	}

	atok
		.groupRule(true)
		// Match / no match
		.ignore().quiet(true).break().next().trimLeft()
		.continue( 0, atok._helper_continueFailure(props, 2 + quotesNum + 1, 0) )
		.addRule(start, match_start)

		.continue(-1)
			// Check start pattern
			.addRule(start, function matchStart () { count++ })
			// Check this is the end of the match
		.setProps(props) 	// Reset initial properties
		.ignore()			// Force handler triggering
		.quiet(true)		// Only get the pattern size
		.trimLeft() 		// Make sure the handler gets the size of the end pattern
		.continue( atok._helper_continueSuccess(props, quotesNum + 1, -2) )
			.addRule(end, matchEnd, match_done)
		.next().break()

	// Skip strings content
	atok.escape(true).trim().ignore(true)

	for (var i = 0; i < quotesNum; i++)
		atok
			// Wait until the full string is found
			.continue( -(i + 3) )
				.wait(stringQuotes[i], stringQuotes[i], 'match-skipStringContent')

	atok.escape().trim(true)

	// Skip anything else
	return atok
		.continue( -(2 + quotesNum + 1) )
			// Go back to start/end check
			.addRule(1, 'match-skipContent')
		// Restore all properties
		.setProps(props)
		.groupRule()
}
// include("helpers/noop.js")
function noop () { return 0 }

module.exports.noop = function (flag) {
	var isIgnored = this.getProps('ignore').ignore

	return flag === false
		? this
		: this
			.ignore(true)
				.addRule(noop)
			.ignore(isIgnored)
}
// include("helpers/number.js")
// positive integers
var numberStart = { start: '0', end: '9' }
module.exports.number = function (/* handler */) {
	var args = this._helper_setArguments([], arguments, 'number')

	if (!args) return this

	var handler = args[0]

	// function numberDone (token, idx, type) {
	// 	// If called, token is always a valid number
	// 	handler(Number(token), idx, type)
	// }

	// return this._helper_word(numberStart, numberDone)

	var atok = this
	var resetMarkedOffset = false	// First helper to set the markedOffset value?
	var running = false				// Current helper running
	var result

	var props = atok.getProps()
	var isQuiet = props.quiet
	var isIgnored = props.ignore

	function number_start () {
		running = true
		// Prevent buffer slicing by atok
		resetMarkedOffset = (atok.markedOffset < 0)
		if (resetMarkedOffset) atok.markedOffset = atok.offset
	}
	function number_check () {
		result = Number( atok.slice(atok.markedOffset, atok.offset) )
		return isFinite(result) ? 0 : -1
	}
	function number_done () {
		running = false
		if (!isIgnored)
			handler(
				isQuiet
					? atok.offset - atok.markedOffset
					: result
			, -1
			, null
			)

		if (resetMarkedOffset) atok.markedOffset = -1
	}
	function number_end () {
		if (running && number_check() >= 0) number_done()
	}

	if (!isIgnored)
		atok.once('end', number_end)

	return atok
		.groupRule(true)
		// Match / no match
		.ignore().quiet(true).break().next()
		.continue( 0, this._helper_continueFailure(props, 2, 0) )
			.addRule(numberStart, number_start)

		// 123
		// ^^^
		.continue(-1).ignore(true)
			.addRule(numberStart, 'number-value')
		// Number parsed, reset the properties except ignore and quiet
		.setProps(props).ignore().quiet(true)
		.continue(
			this._helper_continueSuccess(props, 0, -2)
		, this._helper_continueFailure(props, 0, -2)
		)
			.addRule(number_check, !isQuiet && number_done)
			.addRule(isQuiet && number_done)

		.setProps(props)
		.groupRule()
}
// include("helpers/nvp.js")
// Named value pairs
module.exports.nvp = function (/* charSet, sep, endPattern, handler */) {
	var args = this._helper_setArguments([wordStart, '=', { firstOf: ' \t\n\r' }], arguments, 'nvp')

	if (!args) return this

	var handler = args[3]

	var name = null
	var unquotedValues = args[2] ? (typeof args[2].length !== 'number' || args[2].length === 0) : false
	var jump = 4 + (+unquotedValues)

	var atok = this

	var markedOffset
	var markedOffsetFlag = false

	var props = atok.getProps()
	var isQuiet = props.quiet
	var isIgnored = props.ignore
	var trimRight = +unquotedValues

	function nvp_start (token) {
		name = token
		// Prevent buffer slicing by atok
		markedOffset = atok._mark() - (isQuiet ? token : token.length)
	}
	function nvp_done (value, idx) {
		if (!isIgnored)
			handler(
				isQuiet
					? (atok.offset + value) - markedOffset + trimRight
					: { name: name, value: value }
			, idx
			, null
			)

		atok._unmark()
		name = null
	}

	return atok
		.groupRule(true)
		// Match / no match
		.ignore().break().next()
		.continue( 0, this._helper_continueFailure(props, jump, 0) )
			.chunk(args[0], nvp_start)

		.continue(0)
		.whitespace()
		.ignore(true)
			.addRule(args[1], 'attr-separator')
		.ignore()
		.whitespace()
		// NVP found
		.setProps(props).ignore()
		.continue(
			this._helper_continueSuccess(props, +unquotedValues, -jump + 1)
		,	unquotedValues
				? 0
				: this._helper_continueFailure(props, 0, -jump + 1)
		)
			.string(nvp_done)
		.continue(
			this._helper_continueSuccess(props, 0, -jump)
		,	this._helper_continueFailure(props, 0, -jump)
		)
			.addRule('', args[2], unquotedValues && nvp_done)

		.setProps(props)
		.groupRule()
}
// include("helpers/string.js")
// Delimited string
// start: starting string delimiter (default=")
// end: ending string delimiter. If not set, end = start
module.exports.string = function (/* start, end, esc, handler */) {
	var args = this._helper_setArguments(['"', '"', '\\'], arguments, 'string')

	if (!args) return this

	// Special case: if end is not set, use the start value
	if (arguments.length === 0 || !arguments[1])
		args[1] = args[0]

	var props = this.getProps()
	var esc = args.splice(2, 1)[0]

	return this
		.escape(esc)
			.wait.apply(this, args)
		.setProps(props)
}
// include("helpers/stringList.js")
// Parse a list of strings
// e.g. ('a'|"b") -> [ 'a', 'b' ] with start=(, end=) and sep=|
// In case of error, it calls the handler with an error object
module.exports.stringList = function (/* start, end, sep, handler */) {
	var args = this._helper_setArguments(['(', ')', ','], arguments, 'stringList')

	if (!args) return this

	var start = args[0]
	var end = args[1]
	var sep = args[2]
	var handler = args[3]

	var atok = this
	var resetMarkedOffset = false	// First helper to set the markedOffset value?

	var props = atok.getProps()
	var isQuiet = props.quiet
	var isIgnored = props.ignore

	var list = []
	
	function stringList_start () {
		// Prevent buffer slicing by atok
		resetMarkedOffset = (atok.markedOffset < 0)
		if (resetMarkedOffset) atok.markedOffset = atok.offset
	}
	function stringList_done () {
		if (!isIgnored) handler(list, -1, null)
		if (resetMarkedOffset) atok.markedOffset = -1
		list = []
	}
	function stringList_acc (token) {
		list.push(token)
	}
	function stringList_error () {
		var err = new Error('Parse error')
		err.list = list
		list = err
		stringList_done()
	}

	return atok
		.groupRule(true)
		.ignore().quiet(true).next().break().trim(true)
		.continue( 0, atok._helper_continueFailure(props, 9, 0) )
			.addRule(start, stringList_start)
		
		// Ignore whitespaces: start->first item or separator->next item
		.continue(-1)
			.whitespace()
		// Check for the end of the list
		.setProps(props).ignore().quiet(true)
		.continue( atok._helper_continueSuccess(props, 7, -2) )
			.addRule(end, stringList_done)
		.ignore(isIgnored).quiet(isQuiet)
		.next().break()
		.continue(2)
			// Check for a double quoted string
			.string('"', '"', stringList_acc)
			// Check for a single quoted string
		.continue(1)
			.string("'", "'", stringList_acc)
		.ignore().quiet()

		// If nothing matched at this point -> parse error
		.continue(
			atok._helper_continueSuccess(props, 4, -5)
		,	atok._helper_continueFailure(props, 4, -5)
		)
			.addRule(stringList_error)
		// Ignore whitespaces: current item->separator
		.continue(-1)
			.whitespace()
		// If a separator is found, go back to check for more strings
		.continue(-7).ignore(true)
			.addRule(sep, 'stringList-separator')
		// Check for the end of the list
		.setProps(props).ignore().quiet(true)
		.continue(
			atok._helper_continueSuccess(props, 1, -8)
		)
			.addRule(end, stringList_done)
		// If no sep/end found -> parse error
		.continue(
			atok._helper_continueSuccess(props, 0, -9)
		,	atok._helper_continueFailure(props, 0, -9)
		)
			.addRule(stringList_error)

		.setProps(props)
		.groupRule()
}
// include("helpers/utf8.js")
var charList = ['"', '\\', 'n', 'r', 't', 'b', 'f']
var valueList = ['"', '\\', '\n', '\r', '\t', '\b', '\f']
var valueListBuffer = valueList.map(function (v) { return new Buffer(v) })

module.exports.utf8 = function (/* start, end, esc, handler */) {
  var args = this._helper_setArguments(['"', '"', '\\'], arguments, 'utf8')

  if (!args) return this

  var handler = args.pop()

  // Special case: if end is not set, use the start value
  if (arguments.length === 0 || !arguments[1])
    args[1] = args[0]

  function utf8Done (data) {
    if (isQuiet) return handler(utf8Current)

    if (data.length > 0) utf8Current.push( isBuffer ? new Buffer(data) : data )
    handler(
      typeof data === 'string'
        ? utf8Current.join('')
        : Buffer.concat(utf8Current)
    )
    utf8Current = null
  }

  var atok = this
  var props = this.getProps()

  var isQuiet = props.quiet
  var isBuffer = false

  var utf8Current = null
  var escaped = false
  var escapeOffset = -1

  var leftLength = args[0].length
  var rightLength = args[1].length
  var escLength = args[2].length

  function isEscaped (data, offset) {
    if (!escaped) return -1

    utf8Current = isQuiet
      ? escapeOffset - offset - leftLength
      : escapeOffset > offset + leftLength
          ? [ data.slice(offset + leftLength, escapeOffset) ]
          : []

    return escapeOffset - offset + leftLength
  }

  // Make the rule fail if an escape char was found
  function hasEscapeFirst (data, offset) {
    isBuffer = (!isQuiet && typeof data !== 'string')
    escaped = (this.prev.idx > 0)

    return escaped
      ? ( escapeOffset = offset - escLength, -1 )
      //HACK to bypass the trimLeft/trimRight properties
      : ( this.prev.prev.length = leftLength + 1, atok.offset--, 1 )
  }

  function hasEscape (data, offset) {
    escaped = (this.prev.idx > 0)

    // End of string found
    if (!escaped) {
      this.prev.prev.length = 1
      atok.offset--
      return 1
    }

    // Is there anything to extract?
    // Rule will fail but we still skip the escape char
    if ( escapeOffset + escLength + 1 < offset - escLength ) {
      if (isQuiet) {
        utf8Current += offset - escapeOffset - 2 * escLength - 1
      } else {
          data = data.slice(escapeOffset + escLength + 1, offset - escLength)
          utf8Current.push( isBuffer ? new Buffer(data) : data )
      }

      // Make sure the escapeOffset is moved accordingly
      atok.offset += offset - escapeOffset - 2 * escLength
    } else {
      atok.offset++
    }

    escapeOffset = offset - escLength

    return -1
  }

  return atok
    .groupRule(true)
      .continue(
          this._helper_continueSuccess(props, 5, 0)
        , 0
        )
      .addRule(args[0], { firstOf: args.slice(1) }, hasEscapeFirst, handler)
      // Rule failed:
      // - escape found
      // - not a string
      // - incomplete string
      .ignore().quiet().break().next().trim(true)
      .ignore(true).continue(2)
        // Escape found
        .addRule(isEscaped, 'utf8-checkEscaped')
      .break(true)
        .continue( -3, this._helper_continueFailure(props, 3, -3) )
          .addRule(args[0], 'utf8-checkString')
      .break().continue()
      .ignore()
      // Process escaped char
      .setProps(props)
      .continue(
          this._helper_continueSuccess(props, 2, 0)
        , 0
        )
      .trim(true).quiet()
        .addRule('', { firstOf: args.slice(1) }, hasEscape, utf8Done)
      .ignore().break().next()
        .quiet(true).continue(-2)
          .addRule(charList, function utf8CharPush (data, idx) {
            if (isQuiet) return utf8Current++

            utf8Current.push( isBuffer ? valueListBuffer[idx] :valueList[idx] )
          })
        .quiet().continue(-3).trimRight()
        .addRule('u', 4, function utf8Push (data) {
          if (isQuiet) return utf8Current += 2

          // The escapeOffset is 4 bytes longer
          escapeOffset += 4
          var u = parseInt(data, 16)
          if ( isFinite(u) ) {
            data = String.fromCharCode(u)
            utf8Current.push( isBuffer ? new Buffer(data) : data )
          } else {
            utf8Atok.emit_error( new Error('Invalid unicode: ' + data) )
          }
        })
        .continue().trimRight(true)

    .setProps(props)
    .groupRule()
}
// include("helpers/wait.js")
// Wait on a given pattern: if no match, hold the parsing
// Waiting starts if the __first__ pattern is matched
// Currently only firstMatch of size 1 are supported
// __WARNING__ use continue(...) to resume at the right rule upon new data
module.exports.wait = function (/* pattern[...pattern], handler */) {
	// Set the handler arguments, if any
	var n = arguments.length
	var last = n > 0 ? [ arguments[n-1] ]: []
	var handler = this._helper_setArguments([], last, 'wait')[0]

	if (!handler) return this

	// Convert the arguments object into an array...
	var args = sliceArguments(arguments, 0)
		, firstMatch = args[0]

	if (arguments.length < 2)
		this.emit_error( new Error('wait(): must have at least 2 arguments: pattern[...pattern], handler') )

	// and set the last item as the handler
	args[n-1] = handler

	if ( !/number|string/.test(typeof firstMatch)
	&&	!firstMatch.hasOwnProperty('start')
	&&	!firstMatch.hasOwnProperty('end')
	)
		this.emit_error( new Error('wait(): Invalid first pattern type (must be number/string/object): ' + (typeof firstMatch)) )

	var atok = this
	var props = atok.getProps()

	function wait_start (matched) {
		atok.offset -= matched
	}

	// Expect a number of bytes
	if (typeof firstMatch === 'number') {
		if (firstMatch === 0)
			return atok.addRule.apply(this, args)

		var firstMatchCheck = (firstMatch > 1)

		atok
			.groupRule(true)
			.ignore().quiet(true).break().next()
			.trimLeft()

		// If expecting 1 byte, we already have it since rule is running
		if (firstMatchCheck)
			atok
				.continue(1, 0)
						// If not enough data, wait for some
						.addRule(firstMatch, wait_start)
					.break(true).continue(-2)
						.noop()
					.break()

		// Full check
		atok
				.setProps(props)
				.continue(
					this._helper_continueSuccess(props, 1, -1 -firstMatchCheck)
				)
					.addRule.apply(this, args)
				// break the loop and go back to the full check
				.break(true).continue(-2).next()
					.noop()

		return atok
			.setProps(props)
			.groupRule()
	}

	// First pattern empty or single pattern of size 1
	var firstMatchLength = firstMatch.hasOwnProperty('length')
			? firstMatch.length
			: 1 // { start: ..., end: ... } is of size 1

	if ( firstMatchLength === 0 || (args.length === 2 && firstMatchLength === 1) )
		return atok
			.groupRule(true)
				.continue(
					this._helper_continueSuccess(props, 1, 0)
				)
					.addRule.apply(this, args)
				// break the loop and go back to the full check
				.break(true).continue(-2).next()
					.noop()

			.setProps(props)
			.groupRule()

	atok
		.groupRule(true)
		.ignore().quiet(true).break().next()
		.trimLeft()


	if (args.length === 2) {
		// Only 1 pattern
		atok
			// Not enough data for firstMatch, wait for some
			.continue(1, 0)
				.addRule(firstMatchLength, wait_start)
			.break(true).continue(-2)
				.noop()
			.break()
			.setProps(props)
			.continue( 0, this._helper_continueFailure(props, 0, -3) )
				.addRule(firstMatch, args[1])

	} else {
		// Optimization:
		// .trimLeft(true).addRule(a, ...) <=> addRule('', ...)
		if (props.trimLeft) args[0] = ''

		if (firstMatchLength === 1) {
			// Many patterns
			atok
				.ignore( props.trimLeft )
				.continue( 0, this._helper_continueFailure(props, 2, 0) )
					.addRule(firstMatch, wait_start)

				.setProps(props)
				.continue(
					this._helper_continueSuccess(props, 1, -1)
				)
					.addRule.apply(this, args)
				// break the loop and go back to the full check
				.break(true).continue(-2).next()
					.noop()

		} else {
			// Many patterns with first one of size > 1
			atok
				// First match check...
				// size > 1
				.continue(1, 0)
					// If not enough data to validate the firstMatch, wait for some
					.addRule(firstMatchLength, wait_start)
				.break(true).continue(-2)
					.noop()
				.break()
				.ignore( props.trimLeft )
				.continue( 0, this._helper_continueFailure(props, 2, -3) )
					.addRule(firstMatch, wait_start)

				// Full check
				.setProps(props)
				.continue(
					this._helper_continueSuccess(props, 1, -4)
				)
					.addRule.apply(this, args)
				// break the loop and go back to the full check
				.break(true).continue(-2).next()
					.noop()
		}
	}

	return atok
		.setProps(props)
		.groupRule()
}
// include("helpers/whitespace.js")
// Spaces, tabs, line breaks
// Ignore by default, unless a handler is specified
var whitespaceList = [' ','\t','\n','\r']
module.exports.whitespace = function (/* whitespaceList, handler */) {
	var args = this._helper_setArguments([whitespaceList], arguments, 'whitespace')

	if (!args) return this

	var toIgnore = arguments.length === 0

	var atok = this
	var props = atok.getProps()

	return atok
		.ignore( toIgnore )
		.continue(-1, this._helper_continueFailure(props, 0, 0) )
			.addRule.apply(this, args)
		.setProps(props)
}
// include("helpers/word.js")
// Letters, digits and underscore
// 65-90 97-122, 48-57, 95
/**
 * All arguments are optional
 * delimiters (Array): list of characters delimiting the word
 * handler (String | Function): rule handler
 *
 * *important* word() will always continue(0) at the end to avoid infinite loops
 */
var wordStart = { start: 'aA0_', end: 'zZ9_' }
module.exports.word = function (/* handler */) {
	var args = this._helper_setArguments([], arguments, 'word')

	return !args ? this : this._helper_word(wordStart, args[0])
}
