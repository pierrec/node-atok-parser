function noop () {}

module.exports.noop = function (flag) {
	var isIgnored = this.getProps('ignore').ignore

	return this
		.ignore(true)
			.addRule(flag !== false && noop)
		.ignore(isIgnored)
}
