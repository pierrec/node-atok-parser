// float numbers
module.exports.float = function (/* handler */) {
	var args = this._helper_setArguments([], arguments, 'float')
	var handler = args[0]

	var atok = this

	var props = atok.getProps('quiet', 'ignore')
	var isQuiet = props.quiet
	var isIgnored = props.ignore

	function floatStart (matched) {
		// NB. the offset has already been increased with the match size
		atok.offsetBuffer = atok.offset - matched
	}
	function floatDone (matched) {
		atok.seek(-matched)
		if (!isIgnored)
			handler(
				isQuiet
					? atok.offset - atok.offsetBuffer
					: Number( atok._slice(atok.offsetBuffer, atok.offset) )
			, -1
			, null
			)

		atok.offsetBuffer = -1
	}

	atok
		.saveProps('float')
		.trimLeft()

		.next().quiet(true)
		// -123.456e7
		// ^^^^
		.continue(0, 7) // Digit found / not found
		.addRule({ start: '0-', end: '9-' }, floatStart)
		.continue(-1).ignore(true)
		.addRule(numberStart, 'float-value1')
		// -123.456e7
		//     ^
		.continue(0, 1) // Decimal / No decimal, check exponent
		.addRule('.', 'float-dot')
		// -123.456e7
		//      ^^^
		.continue(-1)
		.addRule(numberStart, 'float-value2')
		// -123.456e7
		//         ^
		.continue(0, 2) // Exponent / No exponent
		.addRule(['e','E'], 'float-exp')
		// -123.456e-7
		//          ^
		.continue(0)
		.addRule(['-','+'], 'float-exp-sign') // Negative or positive exponent
		// -123.456e-7
		//           ^
		.continue(-1)
		.addRule(numberStart, 'float-exp-value')
		// Done!
		.loadProps('float')
		// Force some properties to make sure the handler is executed
		.quiet(true).ignore()
			.addRule(floatDone)
		// Restore the properties
		.quiet(isQuiet).ignore(isIgnored)

	return atok
}
module.exports.float_length = 9
