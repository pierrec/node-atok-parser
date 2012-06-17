// Delimited string
// start: starting string delimiter (default=")
// end: ending string delimiter. If not set, end = start
module.exports.string = function (/* start, end, esc, handler */) {
	var args = this._helper_setArguments(['"', '"', '\\'], arguments, 'string')

	if (!args) return this

	// Special case: if end is not set, use the start value
	// var last = arguments[arguments.length-1]
	// if (arguments.length < 4 && (!last || typeof last === 'function'))
	if (arguments.length === 0 || !arguments[1])
		args[1] = args[0]

	var props = this.getProps()
	var esc = args.splice(2, 1)[0]

	return this
		.escape(esc)
			.wait.apply(this, args)
		.setProps(props)
}
