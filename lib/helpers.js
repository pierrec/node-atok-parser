var Atok = require('atok')
var isArray = require('util').isArray

module.exports._helper_setArguments = function (defaults, args, type) {
	var atok = this, n = args.length
	var res = [].concat(defaults)

	var	defaultHandler = atok.handler || function (token, idx) {
		atok.emit('data', token, idx, type)
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

	function acc (data) {
		current += data
	}
	function done () {
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
	else
		atok
			// while(character matches a word letter)
			.continue(-1)
				.addRule(wordStart, 0, function (token) {
					// Character matches but end of buffer reached
					acc(token)
					if (atok.ending) done()
					// Since continue() is used, the rule index is preserved
					else atok.helpersCache.word = current
				})
			.continue(-2)
				.addRule(wordStart, acc)
			.loadProps('_helper_word')
			.addRule(function () {
				return current.length > 0 ? 0 : -1
			}, done)
	
	return atok
}

// List of characters members of charSet (mandatory argument)
module.exports.chunk = function (charSet, handler) {
	if (arguments.length === 0)
		throw new Error('chunk(): charSet required')
	
	var atok = this
	if (arguments.length === 1)
		handler = atok.handler || function (token, idx) {
			atok.emit('data', token, idx, 'chunk')
		}

	return atok
		.saveProps('chunk')
		._helper_word(null, handler, charSet)
		.loadProps('chunk')
}
// float numbers
module.exports.float = function (delimiters, handler) {
	var args = this._helper_setArguments([null], arguments, 'float')
	var delimiters = args[0], handler = args[1]

	var atok = this

	var current = atok.helpersCache.float || ''
	function _true () {
		return 0
	}
	function acc (data) {
		current += data
	}
	function done () {
		handler(Number(current), -1, null)
		atok.helpersCache.float = current = ''
	}
	function doneDelim (token, idx, type) {
		acc(token)
		var num = Number(current)
		handler( isFinite(num) ? num : current, idx, type )
		atok.helpersCache.float = current = ''
	}
	function checkDone () {
		return current.length > 0 ? 0 : -1
	}

	atok
		.saveProps('float')
		.trimLeft()
		.saveProps('_float')

	if (delimiters)
		// Delimiters known, use this as it is much faster
		atok
			.continue(0)
			.addRule('-', acc)
			.loadProps('_float')
				.addRule(
					numberStart
				, delimiters.length > 1 ? { firstOf: delimiters } : delimiters[0]
				, doneDelim
				)
			.loadProps('float')
	else
		atok
			.continue(0)
			// -123.456e7
			// ^
			.addRule('-', acc)
			// -123.456e7
			//  ^^^
			._helper_word(null, acc, numberStart)
			// -123.456e7
			//     ^
			.continue(1)
			.addRule('.', acc) // Decimal!
			.addRule(_true, _true) // No decimal, check exponent
			// -123.456e7
			//      ^^^
			.continue(0)
			._helper_word(null, acc, numberStart)
			// -123.456e7
			//         ^
			.continue(1)
			.addRule(['e','E'], acc)
			.addRule(checkDone, done) // No exponent
			// -123.456e-7
			//          ^
			.continue(1)
			.addRule(['-','+'], acc) // Negative or positive exponent
			.addRule(_true, _true) // Positive exponent
			// -123.456e-7
			//           ^
			.continue(0)
			._helper_word(null, acc, numberStart)
			// Done!
			.loadProps('float')
			.addRule(checkDone, done)
	
	return atok
}
// positive integers
var numberStart = { start: '0', end: '9' }
module.exports.number = function () {
	var args = this._helper_setArguments([null], arguments, 'number')
	var delimiters = args[0], handler = args[1]

	function done (data) {
		handler(Number(data), -1, null)
	}

	function doneDelim (token, idx, type) {
		var num = Number(token)
		handler( isFinite(num) ? num : token, idx, type )
	}

	this
		.saveProps('number')
		.trimLeft()

	if (delimiters)
		// Delimiters known, use this as it is much faster
		this
			.addRule(
				numberStart
			, delimiters.length > 1 ? { firstOf: delimiters } : delimiters[0]
			, doneDelim
			)
	else
		this
			._helper_word(null, done, numberStart)
	
	return this.loadProps('number')
}
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
// Parse a list of strings
// e.g. ('a'|'b') -> [ 'a', 'b' ] with start=(, end=) and sep=|
module.exports.stringList = function (/* start, end, sep, handler */) {
	var args = this._helper_setArguments(['(', ')', ','], arguments, 'stringList')
	var handler = args[3]

	var atok = this
	var list

	return atok
		.saveProps('stringList')
		.trim(true).next()

		.continue(0)
			.addRule(args[0], function () { list = [] })
			.whitespace()
		.escaped(true)
		.continue(1)
			.addRule('"','"', function (token) { list.push(token) })
		.continue(0)
			.addRule("'","'", function (token) { list.push(token) })
		.escaped()
			.whitespace()
		.continue(-5)
			.ignore(true)
				.addRule(args[2], 'separator-stringList')
			.ignore()
		.loadProps('stringList')
			.addRule(args[1], function () {
				handler(list)
			})

}
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
        utf8Atok.emit('error', new Error('Invalid unicode: ' + data) )
        break
      }
      u = u * 16 + hex
    }
    utf8Current += String.fromCharCode(u)
  })
  .addRule(1, function (data) {
    utf8Atok.emit('error', new Error('Invalid escapee: ' + data) )
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

  function _handler (data) {
    if (data.length < 2) {
      handler(data)
    } else {
      utf8Current = ''
      utf8Atok.write(data)
      handler( utf8Current )
      utf8Current = null
    }
  }

  return this.string(args[0], args[1], _handler)
}
// Spaces, tabs, line breaks
// Ignore by default, unless a handler is specified
module.exports.whitespace = function (handler) {
	return this
		.saveProps('whitespace')
		.ignore( arguments.length === 0 || !handler )
			.addRule(
				[' ','\t','\n','\r']
			, arguments.length === 0 || !handler ? 'whitespace' : handler
			)
		.loadProps('whitespace')
}
// Letters, digits and underscore
// 65-90 97-122, 48-57, 95
/**
 * All arguments are optional
 * delimiters (Array): list of characters delimiting the word
 * handler (String | Function): rule handler
 *
 * *important* word() will always continue(0) at the end to avoid infinite loops
**/
module.exports.word = function () {
	var args = this._helper_setArguments([null], arguments, 'word')

	return this
		.saveProps('word')
		._helper_word(args[0], args[1], { start: 'aA0_', end: 'zZ9_' })
		.loadProps('word')
}
