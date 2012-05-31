function noop () {}

module.exports.noop = function () {
	var isIgnored = this.getProps('ignore').ignore

	return this
		.ignore(true)
			.addRule(noop)
		.ignore(isIgnored)
}
