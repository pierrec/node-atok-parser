// Named value pairs
module.exports.nvp = function (/* charSet, sep, endPattern, handler */) {
	var args = this._helper_setArguments([wordStart, '=', { firstOf: ' \t\n\r' }], arguments, 'nvp')

	if (!args) return this

	var handler = args[3]

	var name = null
	var unquotedValues = args[2] && (typeof args[2].length !== 'number' || args[2].length === 0)
	var jump = 4 + (+unquotedValues)

	var atok = this
	var resetMarkedOffset = false	// First helper to set the markedOffset value?

	var props = atok.getProps()
	var isQuiet = props.quiet
	var isIgnored = props.ignore

	function nvp_start (token) {
		name = token
		// Prevent buffer slicing by atok
		resetMarkedOffset = (atok.markedOffset < 0)
		if (resetMarkedOffset) atok.markedOffset = atok.offset - 1
	}
	function nvp_done (value) {
		if (!isIgnored)
			handler(
				isQuiet
					? atok.offset - atok.markedOffset
					: { name: name, value: value }
			, -1
			, null
			)

		if (resetMarkedOffset) atok.markedOffset = -1
		name = null
	}

	return atok
		.groupRule(true)
		// Match / no match
		.ignore().quiet().break().next()
		.continue( 0, this._helper_continueFailure(props, jump, 0) )
			.chunk(args[0], nvp_start)

		.continue(0)
		.whitespace()
		.ignore(true)
			.addRule(args[1], 'attr-separator')
		.ignore()
		.whitespace()
		// NVP found
		.setProps(props).ignore()
		.continue(
			this._helper_continueSuccess(props, 1, -jump + 1)
		,	this._helper_continueFailure(props, 1, -jump + 1)
		)
			.string(nvp_done)
		.continue(
			this._helper_continueSuccess(props, 0, -jump)
		,	this._helper_continueFailure(props, 0, -jump)
		)
			.addRule('', args[2], unquotedValues && nvp_done)

		.setProps(props)
		.groupRule()
}
