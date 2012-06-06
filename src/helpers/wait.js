// Wait on a given pattern: if no match, hold the parsing
// Waiting starts if the __first__ pattern is matched
// Currently only firstMatch of size 1 are supported
// __WARNING__ use continue(...) to resume at the right rule upon new data
module.exports.wait = function (/* pattern[...pattern], handler */) {
	if (arguments.length < 2)
		throw new Error('wait(): must have at least 2 arguments: pattern[...pattern], handler')

	var args = this._helper_setArguments([], arguments, 'wait')
		, firstMatch = args[0]

	if (firstMatch === 0
	|| typeof firstMatch !== 'number' && firstMatch.length === 0
	)
		throw new Error('wait(): invalid first pattern: ' + firstMatch)

	// Only one pattern
	if (args.length === 1)
		return this.addRule.apply(this, args)

	// Many patterns
	var atok = this

	var props = this.getProps()
	var hasContinue = props.continue
	var cont = hasContinue[0]

	function wait_start (matched) {
		atok.offset -= matched
	}

	return atok
		.groupRule(true)
		// Initial check
		.ignore().quiet(true).next().trimLeft()
		.continue( 0, this._helper_continueFailure(props, 2, 0) )
			.addRule(firstMatch, wait_start)
		// Full check
		.setProps(props)
		.continue( this._helper_continueSuccess(props, 1, -1) )
			.addRule.apply(this, args)
		// break the loop and go back to the full check
		.break(true).continue(-2).next()
			.noop()
		.setProps(props)

		.groupRule()
}
