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

//include("helpers/*.js")
