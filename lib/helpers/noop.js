function noop () { return 0 }

module.exports.noop = function (flag) {
	var isIgnored = this.getProps('ignore').ignore

	return flag === false
		? this
		: this
			.ignore(true)
				.addRule(noop)
			.ignore(isIgnored)
}
