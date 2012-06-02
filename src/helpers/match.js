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
	var count

	var atok = this
	var resetMarkedOffset = false	// First helper to set the markedOffset value?

	var props = atok.getProps()
	var isQuiet = props.quiet
	var isIgnored = props.ignore
	var hasContinue = props.continue
	var cont = hasContinue[0]

	function match_start (matched) {
		count = 1
		// Prevent buffer slicing by atok
		resetMarkedOffset = (atok.markedOffset < 0)
		if (resetMarkedOffset) atok.markedOffset = atok.offset - matched
	}
	function match_done (matched) {
		if (!isIgnored) {
			// Mimic trimRight() behaviour
			var offset = atok.offset - ( props.trimRight ? matched : 0 )
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
	function matchEnd () {
		return --count === 0 ? 0 : -1
	}

	atok
		.groupRule(true)
		// Match / no match
		.ignore().quiet(true)
		.next().continue( 0, this._helper_getContinueFail(props, 2 + quotesNum + 1) )
		.addRule(start, match_start)

		.continue(-1)
			// Check start pattern
			.addRule(start, function matchStart () { count++ })
			// Check this is the end of the match
		.setProps(props) 	// Reset initial properties
		.ignore()			// Force handler triggering
		.quiet(true)		// Only get the pattern size
		.trimLeft() 		// Make sure the handler gets the size of the end pattern
		.continue(cont === null ? null : cont + (cont < 0 ? -2 : quotesNum + 2))
			.addRule(end, matchEnd, match_done)
		.next()

	// Skip strings content
	atok.escape(true).trim().ignore(true)

	for (var i = 0; i < quotesNum; i++)
		atok
			// Wait until the full string is found
			.continue( -(i + 3) )
				// .addRule(stringQuotes[i], stringQuotes[i], function(){})
				.wait(stringQuotes[i], stringQuotes[i], function(){})
				//TODO when helpers support non function last arg
				// .wait(stringQuotes[i], stringQuotes[i], 'match-skipStringContent')

	atok.escape().trim(true)

	// Skip anything else
	return atok
		.continue( -(2 + quotesNum + 1) )
			// Go back to start/end check
			.addRule(1, 'match-skipContent')
		// Restore all properties
		.setProps(props)
		.groupRule()
}
