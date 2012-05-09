// match a pattern bypassing strings (double or single quote, or both)
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

	var atok = this

	var quotesNum = stringQuotes.length
	var props = atok.getProps('quiet', 'ignore')
	var isQuiet = props.quiet
	var isIgnored = props.isIgnored

	var count = -1
	var startOffset = -1

	function matchInit (token) {
		// First start
		count = 1
		// Current offset
		startOffset = atok.offset
					- ( isQuiet
							? 0
							: typeof token === 'number' ? token : token.length
						)
		atok.offsetBuffer = startOffset
	}
	function matchLastEnd () {
		count = 0
		// On last match, offset by -1 so last rule is triggered on empty buffer
		atok.seek(-1)
	}
	function matchDone (matched) {
		var endOffset = atok.offset - matched

		if (!isIgnored)
			handler(
				isQuiet
					? endOffset - startOffset
					: atok._slice(startOffset, endOffset)
			)

		count = -1
		startOffset = -1
		atok.offsetBuffer = -1
	}

	atok
		.saveProps('match')
		.next()
		// Start found, apply the helper rules / No start found, end now
		.continue( 0, 2*quotesNum + 4 )
			.addRule(start, matchInit)
		.continue(-1)
			// Check start pattern
			.addRule(start, function matchStart () { count++ })
		// 2=end + acc
		.continue( quotesNum*atok.wait_length + 2 )
			// Check end pattern: last or not?
			.addRule(end, function () { return count === 1 ? 0 : -1 }, matchLastEnd)
		.continue(-3)
			.addRule(end, function matchEnd () { count-- })

	// Skip strings content
	if (quotesNum > 0) {
		atok.escaped(true).trim()

		for (var i = 0; i < quotesNum; i++)
			atok
				// Wait until the full string is found
				.continue( -(i*atok.wait_length + 4) ).ignore(true)
					.wait(stringQuotes[i], stringQuotes[i], function () {})

		atok.escaped().trim(true).ignore()
	}

	return atok
		.continue( -(quotesNum*atok.wait_length + 4) ).ignore(true)
			// Go back to start/end check
			.addRule(1, 'skip')
		// If data found, send it
		.loadProps('match')
		// If 0 is returned and continue(), the rule index is not reset
		// => return 1 and seek(-1) in the handler!
		.quiet(true).ignore()
			.addRule(function () { return count === 0 ? 1 : -1 }, matchDone)
		.quiet(isQuiet).ignore(isIgnored)
}
// TODO: length is dynamic...which is not supported
module.exports.match_length = '6 + 2 * wait_length'
