/*
	Best practices:
	- name the handlers according to the helper name (useful in debug mode)
 */
var isArray = require('util').isArray
var Atok = require('atok')

// if a handler is to be defined it *must* be a function
module.exports._helper_setArguments = function (defaults, args, type) {
	var atok = this, n = args.length
	var res = defaults

	// Set the handler
	var handler = n > 0 && typeof args[n-1] === 'function'
		? args[--n]
		: (atok.handler || function helperDefaultHandler (token) {
						atok.emit_data(token, arguments.length > 1 ? arguments[1] : -1, type)
					})
	
	var i = 0
	while (i < n) {
		if (args[i]) res[i] = args[i]
		i++
	}

	return res.concat(handler)
}

module.exports._helper_continueFailure = function (props, jumpPos, jumpNeg) {
	var cont = props.continue[1]
	return cont + (cont < 0 ? jumpNeg : jumpPos)
}
module.exports._helper_continueSuccess = function (props, jumpPos, jumpNeg) {
	var cont = props.continue[0]
	return cont === null ? null : cont + (cont < 0 ? jumpNeg : jumpPos)
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
		resetMarkedOffset = (atok.markedOffset < 0)
		if (resetMarkedOffset) atok.markedOffset = atok.offset - 1
	}
	function _helper_done () {
		running = false
		if (!isIgnored)
			handler(
				isQuiet
					? atok.offset - atok.markedOffset
					: atok.slice(atok.markedOffset, atok.offset)
			, -1
			, null
			)

		if (resetMarkedOffset) atok.markedOffset = -1
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
	if (arguments.length === 0)
		throw new Error('chunk(): charSet required')
	
	var args = this._helper_setArguments([null], arguments, 'chunk')

	return this._helper_word(args[0], args[1])
}
// include("helpers/float.js")
// float numbers
var floatStart = { start: '0-', end: '9-' }
module.exports.float = function (/* handler */) {
	var args = this._helper_setArguments([], arguments, 'float')
	var handler = args[0]
	var result

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
		if (resetMarkedOffset) atok.markedOffset = atok.offset - 1
	}
	function float_check () {
		result = Number( atok.slice(atok.markedOffset, atok.offset) )
		return isFinite(result) ? 0 : -1
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
		.continueGroup(0, true)
			.addRule(floatStart, float_start)
		.continueGroup()

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
		.continueGroup(true, true)
			.addRule(float_check, !isQuiet && float_done)
			.addRule(isQuiet && float_done)

		.setProps(props)
		.groupRule()
}
// include("helpers/match.js")
// match a pattern bypassing strings (double or single quote, or both) (default=both)
// ex: (a("(b")c) -> a("(b")c
module.exports.match = function (/* start, end, stringQuotes, handler */) {
	var args = this._helper_setArguments([null,null,['"',"'"]], arguments, 'match')
	var start = args[0]
		, end = args[1]
		, stringQuotes = args[2]
		, handler = args[3]

	if (start === null || end === null)
		throw new Error('match(): start and end required')

	if ( !isArray(stringQuotes) )
		throw new Error('match(): stringQuotes must be an Array')

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
		if (resetMarkedOffset) atok.markedOffset = atok.offset - matched
	}
	function match_done (matched) {
		if (!isIgnored) {
			// Mimic trimRight() behaviour
			var offset = atok.offset - ( props.trimRight ? matched : 0 )
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
		.ignore().quiet(true).break().next()
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
				.wait(stringQuotes[i], stringQuotes[i], function(){})
				//TODO when helpers support non function last arg
				// .wait(stringQuotes[i], stringQuotes[i], 'match-skipStringContent')

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
function noop () {}

module.exports.noop = function (flag) {
	var isIgnored = this.getProps('ignore').ignore

	return this
		.ignore(true)
			.addRule(flag !== false && noop)
		.ignore(isIgnored)
}
// include("helpers/number.js")
// positive integers
var numberStart = { start: '0', end: '9' }
module.exports.number = function (/* handler */) {
	var args = this._helper_setArguments([], arguments, 'number')
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
		if (resetMarkedOffset) atok.markedOffset = atok.offset - 1
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
	var handler = args[3]

	var name = null
	var unquotedValues = args[2] && (typeof args[2].length !== 'number' || args[2].length === 0)
	var jump = 4 + (+unquotedValues)

	var atok = this
	var resetMarkedOffset = false	// First helper to set the markedOffset value?

	var props = atok.getProps()
	var isQuiet = props.quiet
	var isIgnored = props.ignore

	function nvp_start (token) {
		name = token
		// Prevent buffer slicing by atok
		resetMarkedOffset = (atok.markedOffset < 0)
		if (resetMarkedOffset) atok.markedOffset = atok.offset - 1
	}
	function nvp_done (value) {
		if (!isIgnored)
			handler(
				isQuiet
					? atok.offset - atok.markedOffset
					: { name: name, value: value }
			, -1
			, null
			)

		if (resetMarkedOffset) atok.markedOffset = -1
		name = null
	}

	return atok
		.groupRule(true)
		// Match / no match
		.ignore().quiet().break().next()
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
			this._helper_continueSuccess(props, 1, -jump + 1)
		,	this._helper_continueFailure(props, 1, -jump + 1)
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

	// Special case: if end is not set, use the start value
	var last = arguments[arguments.length-1]
	if (arguments.length < 4 && (!last || typeof last === 'function'))
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
			.string('"', stringList_acc)
			// Check for a single quoted string
		.continue(1)
			.string("'", stringList_acc)
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
var utf8Atok = new Atok()

var utf8Current = ''
var charList = ['"', '\\', 'n', 'r', 't', '/', 'b', 'f']
var valueList = ['"', '\\', '\n', '\r', '\t', '\/', '\b', '\f']

utf8Atok
  .next('expectEscape')
  .quiet(true)
    .addRule(charList, function (data, idx) {
      utf8Current += valueList[idx]
    })
  .quiet()
  .addRule('u', 4, function (data) {
    var u = parseInt(data, 16)
    if ( isFinite(u) )
      utf8Current += String.fromCharCode(u)
    else
      utf8Atok.emit_error( new Error('Invalid unicode: ' + data) )
  })
  .addRule(1, function (data) {
    utf8Atok.emit_error( new Error('Invalid escapee: ' + data) )
  })
  .saveRuleSet('expectEscapee')

  .clearRule()
  .next('expectEscapee')
  .addRule('', '\\', function (data) {
    utf8Current += data
  })
  .next('expectEscape')
  .addRule('', function (data) {
    if (utf8Current.length > 0)
      utf8Current += data
    else
      utf8Current = data
  })
  .saveRuleSet('expectEscape')

module.exports.utf8 = function (/* start, end, esc, handler */) {
  var args = this._helper_setArguments([], arguments, 'utf8')
  var handler = args.pop()

  function utf8Handler (data) {
    // Either not enough data to have UTF8 data or `quiet(true)`
    if (data.length < 2 || typeof data === 'number') {
      handler(data)
    } else {
      utf8Atok.write(data)
      handler( utf8Current )
      utf8Current = ''
    }
  }

  args.push(utf8Handler)

  return this.string.apply(this, args)
}
// include("helpers/wait.js")
// Wait on a given pattern: if no match, hold the parsing
// Waiting starts if the __first__ pattern is matched
// Currently only firstMatch of size 1 are supported
// __WARNING__ use continue(...) to resume at the right rule upon new data
module.exports.wait = function (/* pattern[...pattern], handler */) {
	if (arguments.length < 2)
		throw new Error('wait(): must have at least 2 arguments: pattern[...pattern], handler')

	var args = this._helper_setArguments([''], arguments, 'wait')
		, firstMatch = args[0]

	if ( !/number|string/.test(typeof firstMatch)
	&&	!firstMatch.hasOwnProperty('start')
	&&	!firstMatch.hasOwnProperty('end')
	)
		throw new Error('wait(): Invalid first pattern type (must be number/string/object): ' + (typeof firstMatch))

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
	// if ( !firstMatch.hasOwnProperty('length') )
		// throw new Error('wait(): Invalid first pattern type (no length): ' + firstMatch)

	var firstMatchLength = firstMatch.hasOwnProperty('length')
			? firstMatch.length
			: 1 // { start: ..., end: ... } is of size 1

	if ( firstMatchLength === 0 || (args.length === 2 && firstMatchLength === 1) )
		return atok.addRule.apply(this, args)

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

	var toIgnore = arguments.length === 0
			|| typeof arguments[arguments.length-1] !== 'function'

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
**/
var wordStart = { start: 'aA0_', end: 'zZ9_' }
module.exports.word = function (/* handler */) {
	var args = this._helper_setArguments([], arguments, 'word')

	return this._helper_word(wordStart, args[0])
}
