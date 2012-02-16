// float numbers
module.exports.float = function (delimiters, handler) {
	var args = this._helper_setDelimiterArguments(arguments, 'float')
	var delimiters = args[0], handler = args[1]

	var atok = this

	var current = atok.helpersCache.float || ''
	function _true () {
		return 0
	}
	function acc (data) {
		current += data
	}
	function done () {
		handler(Number(current), -1, null)
		atok.helpersCache.float = current = ''
	}
	function doneDelim (token, idx, type) {
		acc(token)
		var num = Number(current)
		handler( isFinite(num) ? num : current, idx, type )
		atok.helpersCache.float = current = ''
	}
	function checkDone () {
		return current.length > 0 ? 0 : -1
	}

	atok
		.saveProps('float')
		.trimLeft()
		.saveProps('_float')

	if (delimiters)
		// Delimiters known, use this as it is much faster
		atok
			.continue(0)
			.addRule('-', acc)
			.loadProps('_float')
				.addRule(
					numberStart
				, delimiters.length > 1 ? { firstOf: delimiters } : delimiters[0]
				, doneDelim
				)
			.loadProps('float')
	else
		atok
			.continue(0)
			// -123.456e7
			// ^
			.addRule('-', acc)
			// -123.456e7
			//  ^^^
			._helper_word(null, acc, numberStart)
			// -123.456e7
			//     ^
			.continue(1)
			.addRule('.', acc) // Decimal!
			.addRule(_true, _true) // No decimal, check exponent
			// -123.456e7
			//      ^^^
			.continue(0)
			._helper_word(null, acc, numberStart)
			// -123.456e7
			//         ^
			.continue(1)
			.addRule(['e','E'], acc)
			.addRule(checkDone, done) // No exponent
			// -123.456e-7
			//          ^
			.continue(1)
			.addRule(['-','+'], acc) // Negative or positive exponent
			.addRule(_true, _true) // Positive exponent
			// -123.456e-7
			//           ^
			.continue(0)
			._helper_word(null, acc, numberStart)
			// Done!
			.loadProps('float')
			.addRule(checkDone, done)
	
	return atok
}
