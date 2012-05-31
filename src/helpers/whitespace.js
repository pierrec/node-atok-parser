// Spaces, tabs, line breaks
// Ignore by default, unless a handler is specified
module.exports.whitespace = function (/* handler */) {
	var atok = this

	var handler = arguments.length > 0
		? arguments[0]
		: function whitespaceDefaultHandler (token) {
				atok.emit_data(token, arguments.length > 1 ? arguments[1] : -1, 'whitespace')
			}

	var isIgnored = atok.getProps('ignore').ignore

	return atok
		.ignore( arguments.length === 0 )
			.addRule(
				[' ','\t','\n','\r']
			, handler
			)
		.ignore(isIgnored)
}
