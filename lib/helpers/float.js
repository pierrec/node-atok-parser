// float numbers
var floatStart = { start: '0-', end: '9-' }
module.exports.float = function (/* handler */) {
	var args = this._helper_setArguments([], arguments, 'float')

	if (!args) return this
	
	var handler = args[0]
	var result
	var startOffset

	var atok = this
	var resetMarkedOffset = false	// First helper to set the markedOffset value?
	var running = false				// Current helper running

	var props = atok.getProps()
	var isQuiet = props.quiet
	var isIgnored = props.ignore

	function float_start () {
		running = true
		// Prevent buffer slicing by atok
		resetMarkedOffset = (atok.markedOffset < 0)
		if (resetMarkedOffset) atok.markedOffset = atok.offset
		startOffset = atok.offset
	}
	function float_check () {
		result = Number( atok.slice(atok.markedOffset, atok.offset) )

		// Valid float if the value is not NaN
		if ( result === +result ) return 0

		// Invalid float (NaN)
		running = false
		if (resetMarkedOffset) atok.markedOffset = -1
		atok.offset = startOffset // Keep the position in the buffer

		return -1
	}
	function float_done () {
		running = false
		if (!isIgnored)
			handler(
				isQuiet
					? atok.offset - atok.markedOffset
					: result
			, -1
			, null
			)

		if (resetMarkedOffset) atok.markedOffset = -1
	}
	function float_end () {
		if (running && float_check() >= 0) float_done()
	}

	if (!isIgnored)
		atok.once('end', float_end)

	return atok
		.groupRule(true)
		// Match / no match
		.ignore().quiet(true).break().next()
		.continue( 0, this._helper_continueFailure(props, 7, 0) )
			.addRule(floatStart, float_start)

		// -123.456e7
		// ^^^^
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
		// Float parsed, reset the properties except ignore and quiet
		.setProps(props).ignore().quiet(true)
		.continue(
			this._helper_continueSuccess(props, 0, -7)
		,	this._helper_continueFailure(props, 0, -7)
		)
			.addRule(float_check, float_done)

		// Restore all properties
		.setProps(props)
		.groupRule()
}
