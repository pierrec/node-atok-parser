// Named value pairs
module.exports.nvp = function (/* charSet, sep, endPattern, handler */) {
	var args = this._helper_setArguments([wordStart, '=', { firstOf: ' \t\n\r' }], arguments, 'nvp')

	if (!args) return this

	var handler = args[3]

	var name = null
	var unquotedValues = args[2] ? (typeof args[2].length !== 'number' || args[2].length === 0) : false
	var jump = 4 + (+unquotedValues)

	var atok = this
	var markedOffset

	var props = atok.getProps()
	var isQuiet = props.quiet
	var isIgnored = props.ignore
	var trimRight = +unquotedValues

	function nvp_start (token) {
		name = token
		// Prevent buffer slicing by atok
		markedOffset = atok._mark() - (isQuiet ? token : token.length)
	}
	function nvp_done (value, idx) {
		if (!isIgnored)
			handler(
				isQuiet
					? (atok.offset + value) - markedOffset + trimRight
					: { name: name, value: value }
			, idx
			, null
			)

		atok._unmark()
		name = null
	}

	return atok
		.groupRule(true)
		// Match / no match
		.ignore().break().next()
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
			this._helper_continueSuccess(props, +unquotedValues, -jump + 1)
		,	unquotedValues
				? 0
				: this._helper_continueFailure(props, 0, -jump + 1)
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
