// Wait on a given pattern: if no match, hold the parsing
// __WARNING__ use continue(...) to resume at the right rule upon new data
module.exports.wait = function (/* pattern[...pattern], handler */) {
	if (arguments.length < 2)
		throw new Error('wait(): must have at least 2 arguments: pattern[...pattern], handler')

	var args = this._helper_setArguments([], arguments, 'wait')
		, firstMatch = args[0]
		
	if (firstMatch.length === 0)
		throw new Error('wait(): invalid first pattern')

	var atok = this

	var cont = atok.getProps('continue').continue
		.map(function (c) {
			return c === null ? null : c < 0 ? c : c + 1
		})

	function wait () {
		atok.seek(-firstMatch.length)
	}

	atok.saveProps('wait')

		.continue(cont[0], cont[1])
			.addRule.apply(atok, args)

		.continue(-2).next().ignore()
			.break(true).quiet(true).trim(true)
				.addRule(firstMatch, wait)

	return atok.loadProps('wait')
}
module.exports.wait_length = 2
