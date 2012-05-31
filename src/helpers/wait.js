// Wait on a given pattern: if no match, hold the parsing
// Waiting starts if the __first__ pattern is matched
// Currently only firstMatch of size 1 are supported
// __WARNING__ use continue(...) to resume at the right rule upon new data
module.exports.wait = function (/* pattern[...pattern], handler */) {
	if (arguments.length < 2)
		throw new Error('wait(): must have at least 2 arguments: pattern[...pattern], handler')

	var args = this._helper_setArguments([], arguments, 'wait')
		, firstMatch = args[0]
		, handler = args.pop()

	if (firstMatch === 0
	|| typeof firstMatch !== 'number' && firstMatch.length === 0
	)
		throw new Error('wait(): invalid first pattern: ' + firstMatch)

	// Only one pattern
	if (args.length === 1)
		return this.addRule(firstMatch, handler)

	// Many patterns
	var props = this.getProps()

	return this
		.groupRule(true)
		// Initial check
		.ignore(true).next()
		.continue( 0, this._helper_getContinueFail(props, 2) )
			.addRule(firstMatch, 'wait-firstMatch')
		// Full check
		.setProps(props)
		.continue( this._helper_getContinueSuccess(props, 2) )
			.addRule.apply(this, args)
		// break the loop and go back to the full check
		.break(true).continue(-2).next()
			.noop()
		.setProps(props)

		.groupRule()
}
