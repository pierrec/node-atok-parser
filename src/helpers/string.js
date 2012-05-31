// Delimited string
// start: starting string delimiter
// end: ending string delimiter. If not set, end = start
module.exports.string = function (/* start, end, handler */) {
	var args = this._helper_setArguments(['"', '"'], arguments, 'string')

	// Special case: if end is not set, use the start value
	var last = arguments[arguments.length-1]
	if (arguments.length < 3 && (!last || typeof last === 'function'))
		args[1] = args[0]
	
	var props = this.getProps()

	return this
		.escape(true).trim(true)
			.addRule(args[0], args[1], args[2])
		.setProps(props)
}
