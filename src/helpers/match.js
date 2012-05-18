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

	function matchEnd (matched) {
		if (count === 0) {
			// Check for trimLeft and trimRight
			if (props.trimLeft) startOffset += firstMatchLen
			// Hack: should use seek()
			if (props.trimRight) atok.offset -= matched
			// Done!
			_helper_done(0)
			// Hack: should use seek()
			if (props.trimRight) atok.offset += matched
		}
		else count--
	}

	var helperId = '_helper_match'
	var firstMatch = start
//var res = false
//include("../helpers_common_start.js")

		.continue(-1).quiet(true)
			// Check start pattern
			.addRule(start, function matchStart () { count++ })
		.continue(-2).trimLeft()
			// Check end pattern: last one or not?
			.addRule(end, matchEnd)
		.quiet().trimLeft(true)

		// End detection does not require use of the [end] event
		.off('end', _helper_end)

	// Skip strings content
	if (quotesNum > 0) {
		atok.escaped(true).trim().ignore(true)

		for (var i = 0; i < quotesNum; i++)
			atok
				// Wait until the full string is found
				.continue( -(i + 3) )
					.wait(stringQuotes[i], stringQuotes[i], function(){})
					//TODO when helpers support non function last arg
					// .wait(stringQuotes[i], stringQuotes[i], 'match-skipStringContent')

		atok.escaped().trim(true).ignore()
	}

	// Skip anything else
	atok
		.continue().ignore(true)
			// Go back to start/end check
			.addRule(1, 'match-skipContent')

//include("../helpers_common_end.js")
}
