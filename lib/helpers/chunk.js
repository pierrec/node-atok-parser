// List of characters members of charSet (mandatory argument)
module.exports.chunk = function (/* charSet, handler */) {
	if (arguments.length < 1)
		this.emit_error( new Error('chunk(): charSet required') )
	
	var args = this._helper_setArguments([null], arguments, 'chunk')

	return !args ? this : this._helper_word(args[0], args[1])
}
