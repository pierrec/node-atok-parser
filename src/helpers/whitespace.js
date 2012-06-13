// Spaces, tabs, line breaks
// Ignore by default, unless a handler is specified
var whitespaceList = [' ','\t','\n','\r']
module.exports.whitespace = function (/* whitespaceList, handler */) {
	var args = this._helper_setArguments([whitespaceList], arguments, 'whitespace')

	var toIgnore = arguments.length === 0
			|| typeof arguments[arguments.length-1] !== 'function'

	var atok = this
	var props = atok.getProps()

	return atok
		.ignore( toIgnore )
		.continue(-1, this._helper_continueFailure(props, 0, 0) )
			.addRule.apply(this, args)
		.setProps(props)
}
