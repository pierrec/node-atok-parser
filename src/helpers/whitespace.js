// Spaces, tabs, line breaks
// Ignore by default, unless a handler is specified
module.exports.whitespace = function (/* handler */) {
	return this
		.saveProps('whitespace')
		.ignore( arguments.length === 0 || !handler )
			.addRule(
				[' ','\t','\n','\r']
			, arguments.length === 0 || !handler ? 'whitespace' : handler
			)
		.loadProps('whitespace')
}
