// Wait on a given pattern: if no match, hold the parsing
// __WARNING__ use continue(...) to resume at the right rule upon new data
module.exports.wait = function (pattern) {
	var atok = this

	function wait () {
		atok.seek(-pattern.length)
	}

	return atok
		.saveProps('wait')
		.trim(true).next()
			.break(true).quiet(true)
				.addRule(pattern, wait)
		.loadProps('wait')
}
module.exports.wait_length = 1
