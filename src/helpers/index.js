var Atok = require('atok')
var isArray = require('util').isArray

// Set the delimiters and handler arguments
module.exports._helper_setDelimiterArguments = function (args, type) {
	var atok = this, n = args.length
	var delimiters = args[0]
		, handler = args[1]

	if (n === 0 || typeof args[n-1] !== 'function')
		handler = atok.handler || function (token, idx) {
			atok.emit('data', token, idx, type)
		}
	else
		n--
	
	switch (n) {
		case 0:
			handler = handler || delimiters
			delimiters = null
		break
		default:
			delimiters = delimiters || null
	}
	return [ delimiters, handler ]
}

// Set the start, end and handler arguments
module.exports._helper_setStartEndArguments = function (args, type) {
	var atok = this, n = args.length
	var start = args[0]
		, end = args[1]
		, handler = args[2]

	if (n === 0 || typeof args[n-1] !== 'function')
		handler = atok.handler || function (token, idx) {
			atok.emit('data', token, idx, type)
		}
	else
		n--
	
	switch (n) {
		case 0:
			handler = handler || start
			end = start = '"'
		break
		case 1:
			handler = handler || end
			if (typeof start === 'number') {
				if (start === 0)
					throw new Error('string(): length cannot be zero')
			}
			else
				end = start = start || '"'
		break
		default:
			start = start || '"'
			end = end || start
	}

	return [ start, end, handler ]
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

//include(whitespace.js)
//include(chunk.js)
//include(word.js)
//include(number.js)
//include(float.js)
//include(string.js)
//include(utf8.js)
