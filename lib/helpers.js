/*
	A helper should honor the current rule properties, including:
	- continue()
	- next()

	Best practices:
	- name the handlers according to the helper name (useful in debug mode)
**/
var Atok = require('atok')
var isArray = require('util').isArray

module.exports._helper_setArguments = function (defaults, args, type) {
	var atok = this, n = args.length
	var res = [].concat(defaults)

	var	defaultHandler = atok.handler || function helperDefaultHandler (token) {
		atok.emit_data(token, arguments.length > 1 ? arguments[1] : -1, type)
	}

	if (n === 0)
		return res.concat(defaultHandler)
	
	// Add the handler
	res.push(typeof args[n-1] === 'function' ? args[--n]: defaultHandler)
	
	var i = 0
	while (i < n) {
		if (args[i]) res[i] = args[i]
		i++
	}

	return res
}

module.exports._helper_word = function (delimiters, handler, wordStart) {
	var atok = this
	var current = atok.helpersCache._helper_word || ''

	function _helper_wordAcc (data) {
		current += data
	}
	function _helper_wordDone () {
		atok.seek(-1) // Get back by one as it was artificially added
		handler(current, -1, null)
		atok.helpersCache._helper_word = current = ''
	}

	atok
		.saveProps('_helper_word')
		.trimLeft()

	if (delimiters)
		// Delimiters known, use this as it is much faster
		atok
			.addRule(
				wordStart
			, delimiters.length > 1 ? { firstOf: delimiters } : delimiters[0]
			, handler
			)
			// Done if stream is ending
			.addRule(wordStart, 0, function () {
					return atok.ending ? 0 : -1
				}
			, handler
			)
			.loadProps('_helper_word')
	else
		atok
			.next()
			// while(character matches a word letter)
			.continue(-1)
				.addRule(wordStart, 0, function _helper_wordWait (token) {
					// Character matches but end of buffer reached
					_helper_wordAcc(token)
					if (atok.ending) _helper_wordDone()
					// Since continue() is used, the rule index is preserved
					else atok.helpersCache.word = current
				})
			.continue(-2)
				.addRule(wordStart, _helper_wordAcc)
			.loadProps('_helper_word')
			.addRule(function () {
				return current.length > 0 ? 1 : -1
			}, _helper_wordDone)

	return atok
}
// Expose the rule real size
module.exports._helper_word_length = 3

// include("helpers/chunk.js")
// List of characters members of charSet (mandatory argument)
module.exports.chunk = function (/* charSet, handler */) {
	if (arguments.length === 0)
		throw new Error('chunk(): charSet required')
	
	var args = this._helper_setArguments([null], arguments, 'chunk')

	return this._helper_word(null, args[1], args[0])
}
module.exports.chunk_length = module.exports._helper_word_length
// include("helpers/float.js")
// float numbers
module.exports.float = function (/* delimiters, handler */) {
	var args = this._helper_setArguments([null], arguments, 'float')
	var delimiters = args[0], handler = args[1]

	var atok = this

	var current = atok.helpersCache.float || ''

	function floatAcc (data) {
		current += data
	}
	function floatDone () {
		atok.seek(-1) // Get back by one as it was artificially added
		handler(Number(current), -1, null)
		atok.helpersCache.float = current = ''
	}
	function floatDoneDelim (token, idx, type) {
		floatAcc(token)
		var num = Number(current)
		handler( isFinite(num) ? num : current, idx, type )
		atok.helpersCache.float = current = ''
	}
	function floatCheckDone () {
		return current.length > 0 ? 1 : -1
	}

	atok
		.saveProps('float')
		.trimLeft()

	if (delimiters)
		// Delimiters known, use this as it is much faster
		atok
			.saveProps('_float')
			.continue(0).next()
			.addRule('-', floatAcc)
			.loadProps('_float')
				.addRule(
					numberStart
				, delimiters.length > 1 ? { firstOf: delimiters } : delimiters[0]
				, floatDoneDelim
				)
			.loadProps('float')
	else
		atok
			.continue(0).next()
			// -123.456e7
			// ^
			.addRule('-', floatAcc)
			// -123.456e7
			//  ^^^
			._helper_word(null, floatAcc, numberStart)
			// -123.456e7
			//     ^
			.continue(1)
			.addRule('.', floatAcc) // Decimal!
			// NB. Returning 0 makes the rule a passthrough equivalent to continue(0) 
			.noop() // No decimal, check exponent
			// -123.456e7
			//      ^^^
			.continue(0)
			._helper_word(null, floatAcc, numberStart)
			// -123.456e7
			//         ^
			.continue(1)
			.addRule(['e','E'], floatAcc)
			.continue( 1 + atok._helper_word_length )
			.noop() // No exponent
			// -123.456e-7
			//          ^
			.continue(0)
			.addRule(['-','+'], floatAcc) // Negative or positive exponent
			// -123.456e-7
			//           ^
			._helper_word(null, floatAcc, numberStart)
			// Done!
			.loadProps('float')
			.addRule(floatCheckDone, floatDone)

	return atok
}
module.exports.float_length = '5 + 2 * noop_length + 3 * _helper_word_length'
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

	var current = atok.helpersCache.match || ''
	var count = atok.helpersCache.matchCount || -1
	var quotesNum = stringQuotes.length

	function matchAcc (data) {
		current += data
	}
	function matchWaitString (len) {
		atok.seek(-len)
		atok.helpersCache.match = current
		atok.helpersCache.matchCount = count
	}
	function matchStart (token, idx) {
		// If quiet(true) do not keep the data
		if (typeof token !== 'number') matchAcc(token)
		count++
	}
	function matchEnd (token, idx) {
		if (typeof token !== 'number') matchAcc(token)
		count--
		// On last match, offset by -1 so last rule is triggered on empty buffer
		if (count === 0) atok.seek(-1)
	}
	function matchSkipString (token) {
		if (typeof token !== 'number') matchAcc(token)
	}
	function matchDone () {
		handler(current)
		atok.helpersCache.match = current = ''
		atok.helpersCache.matchCount = count = -1
	}

	atok
		.saveProps('match')
		.next()
		.continue(1)
			// Start found, apply the helper rules
			.addRule(start, function matchInit () { count = 1 })
		// 4=start + endLast + end + acc
		.continue( 2*quotesNum + 4 )
			// No start found, end now
			.noop()
		.continue(-1)
			// Check start pattern
			.addRule(start, matchStart)
		// 2=end + acc
		.continue( 2*quotesNum + 2 )
			// Check end pattern: last or not?
			.addRule(end, function () { return count === 1 ? 0 : -1 }, matchEnd)
		.continue(-3)
			.addRule(end, matchEnd)

	// Skip strings content
	if (quotesNum > 0) {
		atok.escaped(true).trim()

		for (var i = 0; i < quotesNum; i++)
			atok
				// 4=self + end + endLast + start
				.continue( -(i + 4) )
					// Full string found
					.addRule(stringQuotes[i], stringQuotes[i], matchSkipString)
					// Partial string found, hold on for the end of the string
					// and resume at the string check rule
				.break(true).continue(-2).quiet(true)
					.addRule(stringQuotes[i], matchWaitString)
				.break().quiet()

		atok.escaped().trim(true)
	}

	return atok
		.continue( -(2*quotesNum + 4) )
			// Store data and go back to start/end check
			.addRule(1, matchAcc)
		// If data found, send it
		.loadProps('match')
		// If 0 is returned and continue(), the rule index is not reset
		// => return 1 and seek(-1) in the handler!
		.addRule(function () { return count === 0 ? 1 : -1 }, matchDone)
}
module.exports.match_length = 11
// include("helpers/noop.js")
function _true () {
	return 0
}
module.exports.noop = function () {
	return this
		.saveProps('noop')
			.ignore(true)
				.addRule(_true, 'noop')
		.loadProps('noop')
}
module.exports.noop_length = 1
// include("helpers/number.js")
// positive integers
var numberStart = { start: '0', end: '9' }
module.exports.number = function (/* delimiters, handler */) {
	var args = this._helper_setArguments([null], arguments, 'number')
	var delimiters = args[0], handler = args[1]

	function done (token, idx, type) {
		var num = Number(token)
		handler( isFinite(num) ? num : token, idx, type )
	}

	return this._helper_word(delimiters, done, numberStart)
}
module.exports.number_length = module.exports._helper_word_length
// include("helpers/string.js")
// Delimited string
// start: starting string delimiter - if integer, === string length
// end: ending string delimiter. If not set, end = start
module.exports.string = function (/* start, end, handler */) {
	var args = this._helper_setArguments(['"', '"'], arguments, 'string')

	// Special case: if end is not set, use the start value
	var last = arguments[arguments.length-1]
	if (arguments.length < 3 && (!last || typeof last === 'function'))
		args[1] = args[0]
	
	this
		.saveProps('string')

	if (typeof args[0] === 'number')
		this
			.quiet()
			.addRule(args[0], args[2])
	else
		this
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
	var end = args[1]
	var endLength = end.length
	var handler = args[3]

	var atok = this
	var list = null

	function stringListAcc (token) {
		list.push(token)
	}
	function stringListCheckDone (s, start) {
		// TODO no substr -> atok support for heteregenous array content
		// NB. end cannot be empty
		// Invalid rule if: no start or no end found (invalid one or not received yet)
		return list === null || s.substr(start, endLength) !== end ? -1 : endLength
	}
	function stringListDone () {
		handler(list)
		list = null
	}

	return atok
		.saveProps('stringList')
		.trim(true).next()

		// Check the start of the list
		.continue(1)
			.addRule(args[0], function stringListInit () { list = [] })
		// Start of list not found, go at the end
		.continue(7)
			.noop()
		// Ignore whitespaces: start->first item or separator->next item
		.continue(0)
			.whitespace()
		// Check for a double quoted string
		.escaped(true)
		.continue(3)
			.addRule('"', '"', stringListAcc)
			// Start of string found...wait for its end
		.continue(-2)
			.wait('"')
		// Check for a single quoted string
		.continue(1)
			.addRule("'", "'", stringListAcc)
			// Start of string found...wait for its end
		.continue(-2)
			.wait("'")
		.escaped()
		// Ignore whitespaces: current item->separator
		.continue(0)
			.whitespace()
		// If a separator is found, go back to check for more strings
		.continue(-7)
			.ignore(true)
				.addRule(args[2], 'stringList-separator')
			.ignore()
		// Check the end of the list
		.loadProps('stringList')
			.addRule(stringListCheckDone, stringListDone)
}
module.exports.stringList_length = '5 + noop_length + 2 * whitespace_length + 2 * wait_length'
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
    if (data.length < 2) {
      handler(data)
    } else {
      utf8Current = ''
      utf8Atok.write(data)
      handler( utf8Current )
      utf8Current = null
    }
  }

  return this.string(args[0], args[1], utf8Handler)
}
module.exports.utf8_length = module.exports.string_length
// include("helpers/wait.js")
// Wait on a given pattern: if no match, hold the parsing
// __WARNING__ use continue(...) to resume at the right rule upon new data
module.exports.wait = function (pattern) {
	var atok = this

	function wait () {
		atok.seek(-pattern.length)
	}

	return atok
		.saveProps('wait')
		.trim(true).next()
			.break(true).quiet(true)
				.addRule(pattern, wait)
		.loadProps('wait')
}
module.exports.wait_length = 1
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
module.exports.word = function (/* delimiters, handler */) {
	var args = this._helper_setArguments([null], arguments, 'word')

	return this._helper_word(args[0], args[1], { start: 'aA0_', end: 'zZ9_' })
}
module.exports.word_length = module.exports._helper_word_length
module.exports.float_length = 16
module.exports.stringList_length = 10
