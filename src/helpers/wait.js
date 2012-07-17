// Wait on a given pattern: if no match, hold the parsing
// Waiting starts if the __first__ pattern is matched
// Currently only firstMatch of size 1 are supported
// __WARNING__ use continue(...) to resume at the right rule upon new data
module.exports.wait = function (/* pattern[...pattern], handler */) {
	// Set the handler arguments, if any
	var n = arguments.length
	var last = n > 0 ? [ arguments[n-1] ]: []
	var handler = this._helper_setArguments([], last, 'wait')[0]

	if (!handler) return this

	// Convert the arguments object into an array...
	var args = sliceArguments(arguments, 0)
		, firstMatch = args[0]

	if (arguments.length < 2)
		this.emit_error( new Error('wait(): must have at least 2 arguments: pattern[...pattern], handler') )

	// and set the last item as the handler
	args[n-1] = handler

	if ( !/number|string/.test(typeof firstMatch)
	&&	!firstMatch.hasOwnProperty('start')
	&&	!firstMatch.hasOwnProperty('end')
	)
		this.emit_error( new Error('wait(): Invalid first pattern type (must be number/string/object): ' + (typeof firstMatch)) )

	var atok = this
	var props = atok.getProps()

	function wait_start (matched) {
		atok.offset -= matched
	}

	// Expect a number of bytes
	if (typeof firstMatch === 'number') {
		if (firstMatch === 0)
			return atok.addRule.apply(this, args)

		var firstMatchCheck = (firstMatch > 1)

		atok
			.groupRule(true)
			.ignore().quiet(true).break().next()
			.trimLeft()

		// If expecting 1 byte, we already have it since rule is running
		if (firstMatchCheck)
			atok
				.continue(1, 0)
						// If not enough data, wait for some
						.addRule(firstMatch, wait_start)
					.break(true).continue(-2)
						.noop()
					.break()

		// Full check
		atok
				.setProps(props)
				.continue(
					this._helper_continueSuccess(props, 1, -1 -firstMatchCheck)
				)
					.addRule.apply(this, args)
				// break the loop and go back to the full check
				.break(true).continue(-2).next()
					.noop()

		return atok
			.setProps(props)
			.groupRule()
	}

	// First pattern empty or single pattern of size 1
	var firstMatchLength = firstMatch.hasOwnProperty('length')
			? firstMatch.length
			: 1 // { start: ..., end: ... } is of size 1

	if ( firstMatchLength === 0 || (args.length === 2 && firstMatchLength === 1) )
		return atok
			.groupRule(true)
				.continue(
					this._helper_continueSuccess(props, 1, 0)
				)
					.addRule.apply(this, args)
				// break the loop and go back to the full check
				.break(true).continue(-2).next()
					.noop()

			.setProps(props)
			.groupRule()

	atok
		.groupRule(true)
		.ignore().quiet(true).break().next()
		.trimLeft()


	if (args.length === 2) {
		// Only 1 pattern
		atok
			// Not enough data for firstMatch, wait for some
			.continue(1, 0)
				.addRule(firstMatchLength, wait_start)
			.break(true).continue(-2)
				.noop()
			.break()
			.setProps(props)
			.continue( 0, this._helper_continueFailure(props, 0, -3) )
				.addRule(firstMatch, args[1])

	} else {
		// Optimization:
		// .trimLeft(true).addRule(a, ...) <=> addRule('', ...)
		if (props.trimLeft) args[0] = ''

		if (firstMatchLength === 1) {
			// Many patterns
			atok
				.ignore( props.trimLeft )
				.continue( 0, this._helper_continueFailure(props, 2, 0) )
					.addRule(firstMatch, wait_start)

				.setProps(props)
				.continue(
					this._helper_continueSuccess(props, 1, -1)
				)
					.addRule.apply(this, args)
				// break the loop and go back to the full check
				.break(true).continue(-2).next()
					.noop()

		} else {
			// Many patterns with first one of size > 1
			atok
				// First match check...
				// size > 1
				.continue(1, 0)
					// If not enough data to validate the firstMatch, wait for some
					.addRule(firstMatchLength, wait_start)
				.break(true).continue(-2)
					.noop()
				.break()
				.ignore( props.trimLeft )
				.continue( 0, this._helper_continueFailure(props, 2, -3) )
					.addRule(firstMatch, wait_start)

				// Full check
				.setProps(props)
				.continue(
					this._helper_continueSuccess(props, 1, -4)
				)
					.addRule.apply(this, args)
				// break the loop and go back to the full check
				.break(true).continue(-2).next()
					.noop()
		}
	}

	return atok
		.setProps(props)
		.groupRule()
}
