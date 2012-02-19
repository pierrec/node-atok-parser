// List of characters members of charSet (mandatory argument)
module.exports.chunk = function (/* charSet, handler */) {
	if (arguments.length === 0)
		throw new Error('chunk(): charSet required')
	
	var atok = this
	if (arguments.length === 1)
		handler = atok.handler || function (token, idx) {
			atok.emit('data', token, idx, 'chunk')
		}

	return atok
		.saveProps('chunk')
		._helper_word(null, handler, charSet)
		.loadProps('chunk')
}
