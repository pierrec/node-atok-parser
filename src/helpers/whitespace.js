// Spaces, tabs, line breaks
// Ignore by default, unless a handler is specified
module.exports.whitespace = function (/* handler */) {
	var atok = this

	var handler = arguments.length > 0
		? arguments[0]
		: function whitespaceDefaultHandler (token) {
				atok.emit_data(token, arguments.length > 1 ? arguments[1] : -1, 'whitespace')
			}

	return this
		.saveProps('whitespace')
		.ignore( arguments.length === 0 )
			.addRule(
				[' ','\t','\n','\r']
			, handler
			)
		.loadProps('whitespace')
}
module.exports.whitespace_length = 1
