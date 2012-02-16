// Delimited string
// start: starting string delimiter - if integer, === string length
// end: ending string delimiter. If not set, end = start
module.exports.string = function (/* start, end, handler */) {
	var args = this._helper_setStartEndArguments(arguments, 'string')
	
	this
		.saveProps('string')
	
	if (typeof args[0] === 'number')
		this
			.quiet()
			.addRule(args[0], args[2])
	else
		this
			.escaped(true).trim(true)
			.addRule(args[0], args[1], args[2])

	return this.loadProps('string')
}
