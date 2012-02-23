// Spaces, tabs, line breaks
// Ignore by default, unless a handler is specified
module.exports.whitespace = function (/* handler */) {
	var args = this._helper_setArguments([], arguments, 'whitespace')
	return this
		.saveProps('whitespace')
		.ignore( arguments.length === 0 )
			.addRule(
				[' ','\t','\n','\r']
			, args[0]
			)
		.loadProps('whitespace')
}
