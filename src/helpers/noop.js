function _true () {
	return 0
}
module.exports.noop = function () {
	return this
		.saveProps('noop')
			.ignore(true)
				.addRule(_true, 'noop')
		.loadProps('noop')
}
module.exports.noop_length = 1
