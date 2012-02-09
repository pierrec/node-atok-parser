var isArray = require('util').isArray

// Spaces, tabs, line breaks
// Ignore by default, unless a handler is specified
var whitespace = [' ','\t','\n','\r']
module.exports.whitespace = function (handler) {
	return this
		.saveProps()
		.ignore( arguments.length === 0 || !handler )
			.addRule(
				whitespace
			, arguments.length === 0 || !handler ? 'whitespace' : handler
			)
		.loadProps()
}

// Letters, digits and underscore
// 65-90 97-122, 48-57, 95
/**
 * All arguments are optional
 * delimiters (Array): list of characters delimiting the word
 * handler (String | Function): rule handler
**/
var wordStart = { start: 'aA0_', end: 'zZ9_' }
module.exports.word = function (delimiters, handler) {
	var atok = this

	if (arguments.length === 0) {
		handler = atok.handler || function () {
			atok.emit('data', current, arguments[1], 'word')
		}
	} else if (arguments.length === 1) {
		if (isArray(delimiters)) {
			handler = atok.handler || function (token, idx) {
				atok.emit('data', token, idx, 'word')
			}
		} else {
 			handler = delimiters
			delimiters = null
		}
	}

	var current = ''
	function acc (token, idx, type) {
		current += token
	}
	function done () {
		var res = current
		handler(current, -1, null)
		current = ''
	}

	atok.saveProps().trimLeft()

	if (delimiters)
		// Delimiters known, use this as it is much faster
		atok
			.addRule(
				wordStart
			, delimiters.length > 1 ? { firstOf: delimiters } : delimiters[0]
			, handler
			)
	else
		atok
			// while(character matches a word letter)
			.continue(-1)
				.addRule(wordStart, acc)
			// Make sure we keep going if the followgin rule is matched!
			.continue(0)
			.quiet(true)
				// Word found: there is non matching data
				.addRule(1, function () {
					atok.seek(-1)
					if (current.length) done()
				})
				// Word found only if the stream has ended
				.addRule(0, function (ending) {
					if (current.length && ending) done()
				})
	
	return atok.loadProps()
}

// positive integers
var numberStart = { start: '0', end: '9' }
module.exports.number = function (delimiters, handler) {
	var atok = this

	if (arguments.length === 0) {
		handler = atok.handler || function () {
			atok.emit('data', current, arguments[1], 'number')
		}
	} else if (arguments.length === 1) {
		if (isArray(delimiters)) {
			handler = atok.handler || function (token, idx) {
				atok.emit('data', token, idx, 'number')
			}
		} else {
 			handler = delimiters
			delimiters = null
		}
	}

	var current = ''
	function acc (token, idx, type) {
		current += token
	}
	function done () {
		handler(Number(current), -1, null)
		current = ''
	}

	atok.saveProps().trimLeft()

	if (delimiters)
		// Delimiters known, use this as it is much faster
		atok
			.addRule(
				numberStart
			, delimiters.length > 1 ? { firstOf: delimiters } : delimiters[0]
			, function (token, idx, type) {
					var num = Number(token)
					handler( isFinite(num) ? num : token, idx, type )
				}
			)
	else
		atok
			// while(character matches a digit)
			.continue(-1)
				.addRule(numberStart, acc)
			// Make sure we keep going if the followgin rule is matched!
			.continue(0)
			.quiet(true)
				// Number found: there is non matching data
				.addRule(1, function () {
					atok.seek(-1)
					if (current.length) done()
				})
				// Number found only if the stream has ended
				.addRule(0, function (ending) {
					if (current.length && ending) done()
				})
	
	return atok.loadProps()
}