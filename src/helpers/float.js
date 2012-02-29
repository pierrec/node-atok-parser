// float numbers
module.exports.float = function (/* delimiters, handler */) {
	var args = this._helper_setArguments([null], arguments, 'float')
	var delimiters = args[0], handler = args[1]

	var atok = this

	var current = atok.helpersCache.float || ''

	function floatAcc (data) {
		current += data
	}
	function floatDone () {
		atok.seek(-1) // Get back by one as it was artificially added
		handler(Number(current), -1, null)
		atok.helpersCache.float = current = ''
	}
	function floatDoneDelim (token, idx, type) {
		floatAcc(token)
		var num = Number(current)
		handler( isFinite(num) ? num : current, idx, type )
		atok.helpersCache.float = current = ''
	}
	function floatCheckDone () {
		return current.length > 0 ? 1 : -1
	}

	atok
		.saveProps('float')
		.trimLeft()

	if (delimiters)
		// Delimiters known, use this as it is much faster
		atok
			.saveProps('_float')
			.continue(0).next()
			.addRule('-', floatAcc)
			.loadProps('_float')
				.addRule(
					numberStart
				, delimiters.length > 1 ? { firstOf: delimiters } : delimiters[0]
				, floatDoneDelim
				)
			.loadProps('float')
	else
		atok
			.continue(0).next()
			// -123.456e7
			// ^
			.addRule('-', floatAcc)
			// -123.456e7
			//  ^^^
			._helper_word(null, floatAcc, numberStart)
			// -123.456e7
			//     ^
			.continue(1)
			.addRule('.', floatAcc) // Decimal!
			// NB. Returning 0 makes the rule a passthrough equivalent to continue(0) 
			.noop() // No decimal, check exponent
			// -123.456e7
			//      ^^^
			.continue(0)
			._helper_word(null, floatAcc, numberStart)
			// -123.456e7
			//         ^
			.continue(1)
			.addRule(['e','E'], floatAcc)
			.addRule(floatCheckDone, floatDone) // No exponent
			// -123.456e-7
			//          ^
			.continue(1)
			.addRule(['-','+'], floatAcc) // Negative or positive exponent
			.noop() // Positive exponent
			// -123.456e-7
			//           ^
			.continue(0)
			._helper_word(null, floatAcc, numberStart)
			// Done!
			.loadProps('float')
			.addRule(floatCheckDone, floatDone)

	return atok
}
