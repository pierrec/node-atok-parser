// match a pattern bypassing strings (double or single quote, or both)
// NB: as of this version, escaped patterns are not checked
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
	var count = atok.helpersCache.matchCount || 0
	var quotesNum = stringQuotes.length

	function matchAcc (data) {
		current += data
	}
	function matchWaitString (len) {
		atok.seek(-len)
		atok.helpersCache.match = current
		atok.helpersCache.matchCount = count
	}
	function matchStartEnd (token, idx) {
		// If quiet(true) do not keep the data
		if (typeof token !== 'number') matchAcc(token)
		count += idx > 0 ? -1 : 1
	}
	function matchSkipString (token) {
		if (typeof token !== 'number') matchAcc(token)
	}
	function matchDone () {
		atok.seek(-1) // Get back by one as it was artificially added
		handler(current)
		atok.helpersCache.match = ''
		atok.helpersCache.matchCount = 0
	}

	atok
		.saveProps('match')
		.next()
		.continue(1)
			// Start found, apply the helper rules
			.addRule(start, function matchInit () { count = 1 })
		// 6=noop + start/end + noop + match-not-done + match-done + acc
		.continue( 2*quotesNum + 6 )
			// No start found, end now
			.noop()
		.continue(1)
			// Check start or end patterns
			.addRule([start, end], matchStartEnd)
			// start/end not found
		.continue(2)
			.noop()
		// start/end found, check if we are done
		.ignore(true)
			// Not done
			.continue(-3)
				.addRule(function () {console.log('xx',count); return count > 0 ? 0 : -1 }, 'match-not-done')
			// Done
			.continue( 2*quotesNum + 1 )
				.addRule(_true, 'match-done')
		.ignore()

	// Skip strings content
	if (quotesNum > 0) {
		atok.escaped(true).trim()

		for (var i = 0; i < quotesNum; i++)
			atok
				.continue( -(i + 5) )
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
		.continue( -(2*quotesNum + 5) )
			// Store data and go back to start/end check
			.addRule(1, matchAcc)
		// If data found, send it
		.loadProps('match')
		// If 0 is returned and continue(), the rule index is not reset
		// => return 1 and seek(-1) in the handler!
		.addRule(function () { return count > 0 ? -1 : 1 }, matchDone)
}
