/*
	Best practices:
	- name the handlers according to the helper name (useful in debug mode)
**/
var isArray = require('util').isArray
var Atok = require('atok')

// if a handler is to be defined it *must* be a function
module.exports._helper_setArguments = function (defaults, args, type) {
	var atok = this, n = args.length
	var res = defaults

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

var _helper_ruleset_id = 0
module.exports._helper_word = function (wordStart, handler) {
	var helperId = '_helper_word'
	var firstMatch = wordStart
//include("helpers_common_1.js")
					: atok._slice(atok.offsetBuffer, atok.offset)
//include("helpers_common_2.js")

		// while(character matches a word letter)
		.continue(-1).ignore(true)
			.addRule(wordStart, '_helper_wordCheck')

//include("helpers_common_3.js")
}
// Expose the rule real size
module.exports._helper_word_length = 3

//include("helpers/*.js")
