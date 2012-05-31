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
