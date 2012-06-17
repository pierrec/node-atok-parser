// positive integers
var numberStart = { start: '0', end: '9' }
module.exports.number = function (/* handler */) {
	var args = this._helper_setArguments([], arguments, 'number')

	if (!args) return this

	var handler = args[0]

	// function numberDone (token, idx, type) {
	// 	// If called, token is always a valid number
	// 	handler(Number(token), idx, type)
	// }

	// return this._helper_word(numberStart, numberDone)

	var atok = this
	var resetMarkedOffset = false	// First helper to set the markedOffset value?
	var running = false				// Current helper running
	var result

	var props = atok.getProps()
	var isQuiet = props.quiet
	var isIgnored = props.ignore

	function number_start () {
		running = true
		// Prevent buffer slicing by atok
		resetMarkedOffset = (atok.markedOffset < 0)
		if (resetMarkedOffset) atok.markedOffset = atok.offset - 1
	}
	function number_check () {
		result = Number( atok.slice(atok.markedOffset, atok.offset) )
		return isFinite(result) ? 0 : -1
	}
	function number_done () {
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
	function number_end () {
		if (running && number_check() >= 0) number_done()
	}

	if (!isIgnored)
		atok.once('end', number_end)

	return atok
		.groupRule(true)
		// Match / no match
		.ignore().quiet(true).break().next()
		.continue( 0, this._helper_continueFailure(props, 2, 0) )
			.addRule(numberStart, number_start)

		// 123
		// ^^^
		.continue(-1).ignore(true)
			.addRule(numberStart, 'number-value')
		// Number parsed, reset the properties except ignore and quiet
		.setProps(props).ignore().quiet(true)
		.continue(
			this._helper_continueSuccess(props, 0, -2)
		, this._helper_continueFailure(props, 0, -2)
		)
			.addRule(number_check, !isQuiet && number_done)
			.addRule(isQuiet && number_done)

		.setProps(props)
		.groupRule()
}
