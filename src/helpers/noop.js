function noop () {}

module.exports.noop = function () {
	return this
		.saveProps('noop')
			.ignore(true)
				.addRule(noop)
		.loadProps('noop')
}
module.exports.noop_length = 1