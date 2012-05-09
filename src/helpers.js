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
	function _helper_wordEnd () {
		if (atok.offsetBuffer >= 0) _helper_wordDone(0)
	}

	return atok
		.saveProps('_helper_word')
		.once('end', _helper_wordEnd)
		.trimLeft().next().ignore().quiet(true)

			// Match / no match
			.continue( 0, 2 )
				.addRule(wordStart, _helper_wordStart)

		// while(character matches a word letter)
		.continue(-1).quiet(true)
			.addRule(wordStart, function _helper_wordCheck () {
				// End of buffer reached and stream ending... send the matched data
				if (atok.ending && atok.length === atok.offset)
					_helper_wordDone(0)
			})

		.loadProps('_helper_word')
		.quiet(true).ignore()
			.addRule(_helper_wordDone)
		.quiet(isQuiet).ignore(isIgnored)
}
// Expose the rule real size
module.exports._helper_word_length = 3

//include("helpers/*.js")
