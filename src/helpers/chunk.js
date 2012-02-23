// List of characters members of charSet (mandatory argument)
module.exports.chunk = function (/* charSet, handler */) {
	if (arguments.length === 0)
		throw new Error('chunk(): charSet required')
	
	var args = this._helper_setArguments([null], arguments, 'chunk')

	return this
		.saveProps('chunk')
		._helper_word(null, args[1], args[0])
		.loadProps('chunk')
}
