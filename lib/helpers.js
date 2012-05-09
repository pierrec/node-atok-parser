/*
	Best practices:
	- name the handlers according to the helper name (useful in debug mode)
**/
var isArray = require('util').isArray
var Atok = require('atok')

// if a handler is to be defined it *must* be a function
module.exports._helper_setArguments = function (defaults, args, type) {
	var atok = this, n = args.length
	var res = [].concat(defaults)

	// Set the handler
	var handler = n > 0 && typeof args[n-1] === 'function'
		? args[--n]
		: atok.handler || function helperDefaultHandler (token) {
				atok.emit_data(token, arguments.length > 1 ? arguments[1] : -1, type)
			}
	
	var i = 0
	while (i < n) {
		if (args[i]) res[i] = args[i]
		i++
	}

	return res.concat(handler)
}

module.exports._helper_word = function (wordStart, handler) {
	var atok = this

	var props = atok.getProps('quiet', 'ignore')
	var isQuiet = props.quiet
	var isIgnored = props.ignore

	function _helper_wordStart (matched) {
		atok.offsetBuffer = atok.offset - matched
	}
	function _helper_wordDone (matched) {
		atok.seek(-matched)
		if (!isIgnored)
			handler(
				isQuiet
					? atok.offset - atok.offsetBuffer
					: atok._slice(atok.offsetBuffer, atok.offset)
			, -1
			, null
			)

		atok.offsetBuffer = -1
	}

	return atok
		.saveProps('_helper_word')

		.trimLeft().next().ignore().quiet(true)
			// Match / no match
			.continue( 0, 3 )
				.addRule(wordStart, _helper_wordStart)

		// while(character matches a word letter)
		.continue(-1)
			.addRule(wordStart, 0, function _helper_wordWait () {
				// Character matches but end of buffer reached
				if (atok.ending)
					_helper_wordDone()
				// Since continue() is used, the rule index is preserved
			})
		.continue(-2).ignore(true)
			.addRule(wordStart, '_helper_word-skip')

		.loadProps('_helper_word')
		.quiet(true).ignore()
			.addRule(_helper_wordDone)
		.quiet(isQuiet).ignore(isIgnored)
}
// Expose the rule real size
module.exports._helper_word_length = 3

// include("helpers/chunk.js")
// List of characters members of charSet (mandatory argument)
module.exports.chunk = function (/* charSet, handler */) {
	if (arguments.length === 0)
		throw new Error('chunk(): charSet required')
	
	var args = this._helper_setArguments([null], arguments, 'chunk')

	return this._helper_word(args[0], args[1])
}
module.exports.chunk_length = module.exports._helper_word_length
// include("helpers/float.js")
// float numbers
module.exports.float = function (/* handler */) {
	var args = this._helper_setArguments([], arguments, 'float')
	var handler = args[0]

	var atok = this

	var props = atok.getProps('quiet', 'ignore')
	var isQuiet = props.quiet
	var isIgnored = props.ignore

	function floatStart (matched) {
		// NB. the offset has already been increased with the match size
		atok.offsetBuffer = atok.offset - matched
	}
	function floatDone (matched) {
		atok.seek(-matched)
		if (!isIgnored)
			handler(
				isQuiet
					? atok.offset - atok.offsetBuffer
					: Number( atok._slice(atok.offsetBuffer, atok.offset) )
			, -1
			, null
			)

		atok.offsetBuffer = -1
	}

	atok
		.saveProps('float')
		.trimLeft()

		.next().quiet(true)
		// -123.456e7
		// ^^^^
		.continue(0, 7) // Digit found / not found
		.addRule({ start: '0-', end: '9-' }, floatStart)
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
		// Done!
		.loadProps('float')
		// Force some properties to make sure the handler is executed
		.quiet(true).ignore()
			.addRule(floatDone)
		// Restore the properties
		.quiet(isQuiet).ignore(isIgnored)

	return atok
}
module.exports.float_length = 9
// include("helpers/match.js")
// match a pattern bypassing strings (double or single quote, or both)
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

	var atok = this

	var quotesNum = stringQuotes.length
	var props = atok.getProps('quiet', 'ignore')
	var isQuiet = props.quiet
	var isIgnored = props.isIgnored

	var count = -1
	var startOffset = -1

	function matchInit (token) {
		// First start
		count = 1
		// Current offset
		startOffset = atok.offset
					- ( isQuiet
							? 0
							: typeof token === 'number' ? token : token.length
						)
		atok.offsetBuffer = startOffset
	}
	function matchLastEnd () {
		count = 0
		// On last match, offset by -1 so last rule is triggered on empty buffer
		atok.seek(-1)
	}
	function matchDone (matched) {
		var endOffset = atok.offset - matched

		if (!isIgnored)
			handler(
				isQuiet
					? endOffset - startOffset
					: atok._slice(startOffset, endOffset)
			)

		count = -1
		startOffset = -1
		atok.offsetBuffer = -1
	}

	atok
		.saveProps('match')
		.next()
		// Start found, apply the helper rules / No start found, end now
		.continue( 0, 2*quotesNum + 4 )
			.addRule(start, matchInit)
		.continue(-1)
			// Check start pattern
			.addRule(start, function matchStart () { count++ })
		// 2=end + acc
		.continue( quotesNum*atok.wait_length + 2 )
			// Check end pattern: last or not?
			.addRule(end, function () { return count === 1 ? 0 : -1 }, matchLastEnd)
		.continue(-3)
			.addRule(end, function matchEnd () { count-- })

	// Skip strings content
	if (quotesNum > 0) {
		atok.escaped(true).trim()

		for (var i = 0; i < quotesNum; i++)
			atok
				// Wait until the full string is found
				.continue( -(i*atok.wait_length + 4) ).ignore(true)
					.wait(stringQuotes[i], stringQuotes[i], function () {})

		atok.escaped().trim(true).ignore()
	}

	return atok
		.continue( -(quotesNum*atok.wait_length + 4) ).ignore(true)
			// Go back to start/end check
			.addRule(1, 'skip')
		// If data found, send it
		.loadProps('match')
		// If 0 is returned and continue(), the rule index is not reset
		// => return 1 and seek(-1) in the handler!
		.quiet(true).ignore()
			.addRule(function () { return count === 0 ? 1 : -1 }, matchDone)
		.quiet(isQuiet).ignore(isIgnored)
}
// TODO: length is dynamic...which is not supported
module.exports.match_length = '6 + 2 * wait_length'
// include("helpers/noop.js")
function noop () {}

module.exports.noop = function () {
	return this
		.saveProps('noop')
			.ignore(true)
				.addRule(noop)
		.loadProps('noop')
}
module.exports.noop_length = 1// include("helpers/number.js")
// positive integers
var numberStart = { start: '0', end: '9' }
module.exports.number = function (/* handler */) {
	var args = this._helper_setArguments([], arguments, 'number')
	var handler = args[0]

	function done (token, idx, type) {
		var num = Number(token)
		handler( isFinite(num) ? num : token, idx, type )
	}

	return this._helper_word(numberStart, done)
}
module.exports.number_length = module.exports._helper_word_length
// include("helpers/string.js")
// Delimited string
// start: starting string delimiter
// end: ending string delimiter. If not set, end = start
module.exports.string = function (/* start, end, handler */) {
	var args = this._helper_setArguments(['"', '"'], arguments, 'string')

	// Special case: if end is not set, use the start value
	var last = arguments[arguments.length-1]
	if (arguments.length < 3 && (!last || typeof last === 'function'))
		args[1] = args[0]
	
	this
		.saveProps('string')

		.escaped(true).trim(true)
			.addRule(args[0], args[1], args[2])

	return this.loadProps('string')
}
module.exports.string_length = 1
// include("helpers/stringList.js")
// Parse a list of strings
// e.g. ('a'|"b") -> [ 'a', 'b' ] with start=(, end=) and sep=|
module.exports.stringList = function (/* start, end, sep, handler */) {
	var args = this._helper_setArguments(['(', ')', ','], arguments, 'stringList')
	var start = args[0]
	var end = args[1]
	var endLength = end.length
	var handler = args[3]

	var atok = this
	var list = null

	var props = atok.getProps('quiet', 'ignore')
	var isQuiet = props.quiet
	var isIgnored = props.ignore

	function stringListAcc (token) {
		list.push(token)
	}
	function stringListCheckDone (s, offset) {
		// TODO no substr -> atok support for heteregenous array content
		// NB. end cannot be empty
		// Invalid rule if: no start or no end found (invalid one or not received yet)
		return list === null || s.substr(offset, endLength) !== end ? -1 : endLength
	}
	function stringListDone () {
		if (!isIgnored) handler(list)
		list = null
	}

	return atok
		.saveProps('stringList')
		.trim(true).next()

		// Check the start of the list
		// Start of list not found, go to the end
		.continue( 0, 2*atok.whitespace_length + 2*atok.wait_length + 2 )
			.addRule(start, function stringListInit () { list = [] })
		// Ignore whitespaces: start->first item or separator->next item
		.continue( -atok.whitespace_length )
			.whitespace()
		// Check for a double quoted string
		.escaped(true)
		.continue( atok.wait_length )
			.wait('"', '"', stringListAcc)
		// Check for a single quoted string
		.continue(0)
			.wait("'", "'", stringListAcc)
		.escaped()
		// Ignore whitespaces: current item->separator
		.continue( -atok.whitespace_length )
			.whitespace()
		// If a separator is found, go back to check for more strings
		.continue( -(2*atok.whitespace_length + 2*atok.wait_length + 1) )
			.ignore(true)
				.addRule(args[2], 'stringList-separator')
			.ignore()
		// Check the end of the list
		.loadProps('stringList')
		.quiet(true).ignore()
			.addRule(stringListCheckDone, stringListDone)
		.quiet(isQuiet).ignore(isIgnored)
}
module.exports.stringList_length = '3 + 2 * whitespace_length + 2 * wait_length'
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
    for (var hex, u = 0, i = 0; i < 4; i++) {
      hex = parseInt(data[i], 16)
      if ( !isFinite(hex) ) {
        utf8Atok.emit_error( new Error('Invalid unicode: ' + data) )
        break
      }
      u = u * 16 + hex
    }
    utf8Current += String.fromCharCode(u)
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

module.exports.utf8 = function (/* start, end, handler */) {
  var args = this._helper_setArguments(['"', '"'], arguments, 'utf8')
  var handler = args[2]

  // Special case: if end is not set, use the start value
  var last = arguments[arguments.length-1]
  if (arguments.length < 3 && (!last || typeof last === 'function'))
    args[1] = args[0]

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

  return this.string(args[0], args[1], utf8Handler)
}
module.exports.utf8_length = module.exports.string_length
// include("helpers/wait.js")
// Wait on a given pattern: if no match, hold the parsing
// __WARNING__ use continue(...) to resume at the right rule upon new data
module.exports.wait = function (/* pattern[...pattern], handler */) {
	if (arguments.length < 2)
		throw new Error('wait(): must have at least 2 arguments: pattern[...pattern], handler')

	var args = this._helper_setArguments([], arguments, 'wait')
		, firstMatch = args[0]
		
	if (firstMatch.length === 0)
		throw new Error('wait(): invalid first pattern')

	var atok = this

	var cont = atok.getProps('continue').continue
		.map(function (c) {
			return c === null ? null : c < 0 ? c : c + 1
		})

	function wait () {
		atok.seek(-firstMatch.length)
	}

	atok.saveProps('wait')

		.continue(cont[0], cont[1])
			.addRule.apply(atok, args)

		.continue(-2).next().ignore()
			.break(true).quiet(true).trim(true)
				.addRule(firstMatch, wait)

	return atok.loadProps('wait')
}
module.exports.wait_length = 2
// include("helpers/whitespace.js")
// Spaces, tabs, line breaks
// Ignore by default, unless a handler is specified
module.exports.whitespace = function (/* handler */) {
	var atok = this

	var handler = arguments.length > 0
		? arguments[0]
		: function whitespaceDefaultHandler (token) {
				atok.emit_data(token, arguments.length > 1 ? arguments[1] : -1, 'whitespace')
			}

	return this
		.saveProps('whitespace')
		.ignore( arguments.length === 0 )
			.addRule(
				[' ','\t','\n','\r']
			, handler
			)
		.loadProps('whitespace')
}
module.exports.whitespace_length = 1
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
module.exports.word = function (/* handler */) {
	var args = this._helper_setArguments([], arguments, 'word')

	return this._helper_word({ start: 'aA0_', end: 'zZ9_' }, args[0])
}
module.exports.word_length = module.exports._helper_word_length
module.exports.match_length = 10
module.exports.stringList_length = 9
