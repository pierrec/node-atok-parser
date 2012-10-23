// match a pattern bypassing strings (double or single quote, or both) (default=both)
// ex: (a("(b")c) -> a("(b")c
module.exports.match = function (/* start, end, stringQuotes, handler */) {
	var args = this._helper_setArguments([null,null,['"',"'"]], arguments, 'match')

	if (!args) return this

	var start = args[0]
		, end = args[1]
		, stringQuotes = args[2]
		, handler = args[3]

	if (start === null || end === null)
		this.emit_error( new Error('match(): start and end required') )

	if ( !isArray(stringQuotes) )
		this.emit_error( new Error('match(): stringQuotes must be an Array') )

	var quotesNum = stringQuotes.length
	var count

	var atok = this
	var resetMarkedOffset = false	// First helper to set the markedOffset value?

	var props = atok.getProps()
	var isQuiet = props.quiet
	var isIgnored = props.ignore

	function match_start (matched) {
		count = 1
		// Prevent buffer slicing by atok
		resetMarkedOffset = (atok.markedOffset < 0)
		// Mimic trimLeft() behaviour
		if (resetMarkedOffset)
			atok.markedOffset = atok.offset + ( props.trimLeft ? matched : 0 )
	}
	function match_done (matched) {
		if (!isIgnored) {
			// Mimic trimRight() behaviour
			var offset = atok.offset + ( props.trimRight ? 0 : matched )
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
		.ignore().quiet(true).break().next().trimLeft()
		.continue( 0, atok._helper_continueFailure(props, 2 + quotesNum + 1, 0) )
		.addRule(start, match_start)

		.continue(-1)
			// Check start pattern
			.addRule(start, function matchStart () { count++ })
			// Check this is the end of the match
		.setProps(props) 	// Reset initial properties
		.ignore()			// Force handler triggering
		.quiet(true)		// Only get the pattern size
		.trimLeft() 		// Make sure the handler gets the size of the end pattern
		.continue( atok._helper_continueSuccess(props, quotesNum + 1, -2) )
			.addRule(end, matchEnd, match_done)
		.next().break()

	// Skip strings content
	atok.escape(true).trim().ignore(true)

	for (var i = 0; i < quotesNum; i++)
		atok
			// Wait until the full string is found
			.continue( -(i + 3) )
				.wait(stringQuotes[i], stringQuotes[i], 'match-skipStringContent')

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
