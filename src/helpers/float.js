// float numbers
var floatStart = { start: '0-', end: '9-' }
module.exports.float = function (/* handler */) {
	var args = this._helper_setArguments([], arguments, 'float')
	var handler = args[0]
	var helper_size = 7

	var atok = this
	var resetOffsetBuffer = false	// First helper to set the offsetBuffer value?
	var running = false				// Current helper running

	var props = atok.getProps()
	var isQuiet = props.quiet
	var isIgnored = props.ignore
	var hasContinue = props.continue

	function float_start () {
		running = true
		// Prevent buffer slicing by atok
		resetOffsetBuffer = (atok.offsetBuffer < 0)
		if (resetOffsetBuffer) atok.offsetBuffer = atok.offset - 1
	}
	function float_done_isIgnored () {
		running = false
		if (resetOffsetBuffer) atok.offsetBuffer = -1
	}
	function float_done_isQuiet () {
		running = false
		handler(
			atok.offset - atok.offsetBuffer
		, -1
		, null
		)

		if (resetOffsetBuffer) atok.offsetBuffer = -1
	}
	function float_done () {
		running = false
		handler(
			Number( atok.slice(atok.offsetBuffer, atok.offset) )
		, -1
		, null
		)

		if (resetOffsetBuffer) atok.offsetBuffer = -1
	}
	function float_end () {
		// Only trigger the running helper on the [end] event
		if (running) float_done(0)
	}

	return atok
		.once('end', float_end)

		.groupRule(true)
		// Match / no match
		.trimLeft().ignore().quiet(true)
		.next().continue( 0, hasContinue[1] + (hasContinue[1] < 0 ? 0 : helper_size) )
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
		.continue( hasContinue[0] === null ? null : hasContinue[0] - (hasContinue[0] < 0 ? helper_size : 0) )
		.addRule(isIgnored, float_done_isIgnored)
		.addRule(!isIgnored && isQuiet, float_done_isQuiet)
		.addRule(!isIgnored && !isQuiet, float_done)
		// Restore all properties
		.ignore(isIgnored).quiet(isQuiet)

		.groupRule()
}
