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

//include("helpers/*.js")
