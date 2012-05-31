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

module.exports._helper_getContinueFail = function (props, size) {
	var cont = props.continue[1]
	return cont + (cont < 0 ? 0 : size)
}
module.exports._helper_getContinueSuccess = function (props, size) {
	var cont = props.continue[0]
	return cont === null ? null : cont - (cont < 0 ? size : 0)
}

var _helper_ruleset_id = 0
module.exports._helper_word = function (wordStart, handler) {
	var helper_size = 2

	var atok = this
	var resetMarkedOffset = false	// First helper to set the markedOffset value?
	var running = false				// Current helper running

	var props = atok.getProps()
	var isQuiet = props.quiet
	var isIgnored = props.ignore
	var _continue = props.continue

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
		.ignore().quiet(true)
		.next().continue( 0, this._helper_getContinueFail(props, helper_size) )
		.addRule(wordStart, _helper_start)

		// while(character matches a word letter)
		.continue(-1).ignore(true)
			.addRule(wordStart, '_helper_wordCheck')

		// Word parsed, reset the properties except ignore and quiet
		.setProps(props).ignore().quiet(true)
		.continue( this._helper_getContinueSuccess(props, helper_size) )
		.addRule(_helper_done)
		// Restore all properties
		.ignore(isIgnored).quiet(isQuiet)

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
	var helper_size = 7

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
	function float_done () {
		running = false
		if (!isIgnored)
			handler(
				isQuiet
					? atok.offset - atok.markedOffset
					: Number( atok.slice(atok.markedOffset, atok.offset) )
			, -1
			, null
			)

		if (resetMarkedOffset) atok.markedOffset = -1
	}
	function float_end () {
		if (running) float_done()
	}

	if (!isIgnored)
		atok.once('end', float_end)

	return atok
		.groupRule(true)
		// Match / no match
		.ignore().quiet(true)
		.next().continue( 0, this._helper_getContinueFail(props, helper_size) )
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
		.continue( this._helper_getContinueSuccess(props, helper_size) )
		.addRule(float_done)
		// Restore all properties
		.ignore(isIgnored).quiet(isQuiet)

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
	var count = 0

	function matchStart () {
		count++
	}
	function matchEnd () {
		count--
	}

	var atok = this
	var resetMarkedOffset = false	// First helper to set the markedOffset value?

	var props = atok.getProps()
	var isQuiet = props.quiet
	var isIgnored = props.ignore

	function match_start (matched) {
		// Prevent buffer slicing by atok
		resetMarkedOffset = (atok.markedOffset < 0)
		if (resetMarkedOffset) atok.markedOffset = atok.offset - matched
	}
	function match_done () {
		atok.offset--
		var offset = atok.offset - ( props.trimRight ? end.length : 0 )
		if (!isIgnored) {
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

	atok
		.groupRule(true)
		// Match / no match
		.ignore().quiet(true)
		.next().continue( 0, this._helper_getContinueFail(props, 3 + quotesNum + 1) )
		.addRule(start, match_start)

		.continue(-1)
			// Check start pattern
			.addRule(start, matchStart)
		.continue(-2)
			// Check end pattern...
			.addRule(end, matchEnd)
			// ...last one or not?
		.setProps(props).ignore().quiet(true)
		.continue( this._helper_getContinueSuccess(props, quotesNum + 1), 0 )
			.addRule(function () { return count === 0 ? 1 : -1 }, match_done)
		.next()

	// Skip strings content
	atok.escape(true).trim().ignore(true)

	for (var i = 0; i < quotesNum; i++)
		atok
			// Wait until the full string is found
			.continue( -(i + 4) )
				.addRule(stringQuotes[i], stringQuotes[i], function(){})
				// .wait(stringQuotes[i], stringQuotes[i], function(){})
				//TODO when helpers support non function last arg
				// .wait(stringQuotes[i], stringQuotes[i], 'match-skipStringContent')

	atok.escape().trim(true).ignore()

	// Skip anything else
	return atok
		.continue( -(3 + quotesNum + 1) ).ignore(true)
			// Go back to start/end check
			.addRule(1, 'match-skipContent')
		.groupRule()
}
// include("helpers/noop.js")
function noop () {}

module.exports.noop = function () {
	var isIgnored = this.getProps('ignore').ignore

	return this
		.ignore(true)
			.addRule(noop)
		.ignore(isIgnored)
}
// include("helpers/number.js")
// positive integers
var numberStart = { start: '0', end: '9' }
module.exports.number = function (/* handler */) {
	var args = this._helper_setArguments([], arguments, 'number')
	var handler = args[0]

	function numberDone (token, idx, type) {
		// If called, token is always a valid number
		handler(Number(token), idx, type)
	}

	return this._helper_word(numberStart, numberDone)
}
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
	
	var props = this.getProps()

	return this
		.escape(true).trim(true)
			.addRule(args[0], args[1], args[2])
		.setProps(props)
}
// include("helpers/stringList.js")
// Parse a list of strings
// e.g. ('a'|"b") -> [ 'a', 'b' ] with start=(, end=) and sep=|
// TODO: handle parse errors
module.exports.stringList = function (/* start, end, sep, handler */) {
	var args = this._helper_setArguments(['(', ')', ','], arguments, 'stringList')
	var start = args[0]
	var end = args[1]
	var sep = args[2]
	var endLength = end.length
	var handler = args[3]

	var list = []

	function stringListAcc (token) {
		list.push(token)
	}
	function stringListDone () {
		_helper_done(0)
		list = []
	}

	function wait (c, jump) {
		return atok
			// Check string start...
			.continue(0, 2)
			.ignore(true)
				.addRule(c, c + '-stringStart-stringList')
			.ignore()
			// ...start found, wait for the end of the string
			.continue( jump + 1 ).escaped(true)
				.addRule('', c, stringListAcc)
			.escaped()
			.break(true).continue(-2).ignore(true)
				.addRule(c + '-wait-stringList')
			.break().ignore()
	}

	var helperId = '_helper_stringList'
	var firstMatch = start
// include("../helpers_common_start.js")
// required vars: firstMatch, helperId, handler
// sets: firstMatchLen
// sets: startOffset
	var atok = this

	var firstMatchLen = 0
	var props = atok.getProps('quiet', 'ignore', 'continue', 'trimLeft', 'trimRight')
	var isQuiet = props.quiet
	var isIgnored = props.ignore
	var hasContinue = props.continue[0]

	if (hasContinue !== null && typeof hasContinue !== 'number')
		throw new Error('continue value must be a number: ' + hasContinue)

	var ruleSet			// rule set the helper is called from
		, ruleIndex		// index of the rule calling the helper
	// Current helper rule set id
	var _ruleSet = helperId + '#' + (_helper_ruleset_id++)
	var startOffset 				// Starting offset
	var resetOffsetBuffer = false	// First helper to set the offsetBuffer value?
	var running = false				// Current helper running

	function _helper_start (matched) {
		running = true
		firstMatchLen = matched
		startOffset = atok.offset - matched
		// Prevent buffer slicing by atok
		resetOffsetBuffer = (atok.offsetBuffer < 0)
		if (resetOffsetBuffer) atok.offsetBuffer = startOffset

		// Upon successful completion...
		// Set the rule index to jump to 
		ruleIndex = atok.ruleIndex + hasContinue + 1
		// Set the rule set to load
		ruleSet = atok.currentRule
		if (!ruleSet) {
			// Helper was called from an unsaved rule set
			ruleSet = _ruleSet + '#unsaved'
			atok.saveRuleSet(ruleSet)
		}
	}
	function _helper_done (matched) {
		running = false
		// Resume where it should
		atok.loadRuleSet(ruleSet, ruleIndex)
		// We have some matching which should be reverted
		atok.seek(-matched)

		// Comply to the tokenizer properties
		if (!isIgnored)
			handler(
				isQuiet
					? atok.offset - startOffset
					: [].concat(list)
			, -1
			, null
			)

		if (resetOffsetBuffer) atok.offsetBuffer = -1
	}
	function _helper_doneCancel (matched) {
		running = false
		// Resume at the next rule, as if the first match failed
		atok.loadRuleSet(ruleSet, ruleIndex)
		// We have some matching which should be reverted
		atok.seek(-matched)

		if (resetOffsetBuffer) atok.offsetBuffer = -1
	}
	function _helper_end () {
		// Only trigger the running helper on the [end] event
		if (running) _helper_done(0)
	}

	atok
		.saveProps(helperId)
		.trimLeft().next(_ruleSet).ignore().quiet(true)

			// Rule that will switch to the helper rule set upon match
			.addRule(firstMatch, _helper_start)
		
		// Temporarily save the rule set
		.saveRuleSet(helperId)

		.clearRule()

	// Ignore whitespaces: start->first item or separator->next item
	.continue(-1)
		.whitespace()
	// Check for the end of the list
	.continue()
		.addRule(end, stringListDone)
	// Check for a double quoted string
	wait('"', 4)
		// Check for a single quoted string
	wait("'", 1)

	atok
	// If nothing matched at this point -> parse error
	.continue()
		.addRule(_helper_doneCancel)
	// Ignore whitespaces: current item->separator
	.continue(-1)
		.whitespace()
	// If a separator is found, go back to check for more strings
	.continue(-11)
		.ignore(true)
			.addRule(sep, 'stringList-separator')
		.ignore()
	.continue()
	// Check for the end of the list
		.addRule(end, stringListDone)
	// If no sep/end found -> parse error
		.addRule(_helper_doneCancel)

// include("../helpers_common_end.js")
	return atok
		// Save the helper rule set
		.saveRuleSet(_ruleSet)

		// Restore the current rules and properties
		.loadRuleSet(helperId)
		.deleteRuleSet(helperId)
		.loadProps(helperId)
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
// include("helpers/wait.js")
// Wait on a given pattern: if no match, hold the parsing
// Waiting starts if the __first__ pattern is matched
// Currently only firstMatch of size 1 are supported
// __WARNING__ use continue(...) to resume at the right rule upon new data
module.exports.wait = function (/* pattern[...pattern], handler */) {
	if (arguments.length < 2)
		throw new Error('wait(): must have at least 2 arguments: pattern[...pattern], handler')

	var args = this._helper_setArguments([], arguments, 'wait')
		, firstMatch = args[0]
		, handler = args.pop()

	if (firstMatch === 0
	|| typeof firstMatch !== 'number' && firstMatch.length === 0
	)
		throw new Error('wait(): invalid first pattern: ' + firstMatch)

	// Only one pattern
	if (args.length === 1)
		return this.addRule(firstMatch, handler)

	// Many patterns
	var props = this.getProps()

	return this
		.groupRule(true)
		// Initial check
		.ignore(true).next()
		.continue( 0, this._helper_getContinueFail(props, 2) )
			.addRule(firstMatch, 'wait-firstMatch')
		// Full check
		.setProps(props)
		.continue( this._helper_getContinueSuccess(props, 2) )
			.addRule.apply(this, args)
		// break the loop and go back to the full check
		.break(true).continue(-2).next()
			.noop()
		.setProps(props)

		.groupRule()
}
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

	var isIgnored = atok.getProps('ignore').ignore

	return atok
		.ignore( arguments.length === 0 )
			.addRule(
				[' ','\t','\n','\r']
			, handler
			)
		.ignore(isIgnored)
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
module.exports.word = function (/* handler */) {
	var args = this._helper_setArguments([], arguments, 'word')

	return this._helper_word({ start: 'aA0_', end: 'zZ9_' }, args[0])
}
