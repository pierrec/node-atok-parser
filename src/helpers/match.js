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

	var current = atok.helpersCache.match || ''
	var count = atok.helpersCache.matchCount || -1
	var quotesNum = stringQuotes.length

	function matchAcc (data) {
		current += data
	}
	function matchWaitString (len) {
		atok.seek(-len)
		atok.helpersCache.match = current
		atok.helpersCache.matchCount = count
	}
	function matchStart (token, idx) {
		// If quiet(true) do not keep the data
		if (typeof token !== 'number') matchAcc(token)
		count++
	}
	function matchEnd (token, idx) {
		if (typeof token !== 'number') matchAcc(token)
		count--
		// On last match, offset by -1 so last rule is triggered on empty buffer
		if (count === 0) atok.seek(-1)
	}
	function matchSkipString (token) {
		if (typeof token !== 'number') matchAcc(token)
	}
	function matchDone () {
		handler(current)
		atok.helpersCache.match = current = ''
		atok.helpersCache.matchCount = count = -1
	}

	atok
		.saveProps('match')
		.next()
		.continue(1)
			// Start found, apply the helper rules
			.addRule(start, function matchInit () { count = 1 })
		// 4=start + endLast + end + acc
		.continue( 2*quotesNum + 4 )
			// No start found, end now
			.noop()
		.continue(-1)
			// Check start pattern
			.addRule(start, matchStart)
		// 2=end + acc
		.continue( 2*quotesNum + 2 )
			// Check end pattern: last or not?
			.addRule(end, function () { return count === 1 ? 0 : -1 }, matchEnd)
		.continue(-3)
			.addRule(end, matchEnd)

	// Skip strings content
	if (quotesNum > 0) {
		atok.escaped(true).trim()

		for (var i = 0; i < quotesNum; i++)
			atok
				// 4=self + end + endLast + start
				.continue( -(i + 4) )
					// Full string found
					.addRule(stringQuotes[i], stringQuotes[i], matchSkipString)
					// Partial string found, hold on for the end of the string
					// and resume at the string check rule
				.break(true).continue(-2).quiet(true)
					.addRule(stringQuotes[i], matchWaitString)
				.break().quiet()

		atok.escaped().trim(true)
	}

	return atok
		.continue( -(2*quotesNum + 4) )
			// Store data and go back to start/end check
			.addRule(1, matchAcc)
		// If data found, send it
		.loadProps('match')
		// If 0 is returned and continue(), the rule index is not reset
		// => return 1 and seek(-1) in the handler!
		.addRule(function () { return count === 0 ? 1 : -1 }, matchDone)
}
module.exports.match_length = 11
