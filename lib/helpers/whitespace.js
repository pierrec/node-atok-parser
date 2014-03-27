// Spaces, tabs, line breaks
// Ignore by default, unless a handler is specified
var whitespaceList = [' ','\t','\n','\r']
module.exports.whitespace = function (/* whitespaceList, handler */) {
	var args = this._helper_setArguments([whitespaceList], arguments, 'whitespace')

	if (!args) return this

	var toIgnore = arguments.length === 0

	var atok = this
	var props = atok.getProps()

	return atok
		.ignore( toIgnore )
		.continue(-1, this._helper_continueFailure(props, 0, 0) )
			.addRule.apply(this, args)
		.setProps(props)
}
