// positive integers
var numberStart = { start: '0', end: '9' }
module.exports.number = function (/* handler */) {
	var args = this._helper_setArguments([], arguments, 'number')
	var handler = args[0]

	function numberDone (token, idx, type) {
		// If called, token is always a valid number
		handler(Number(token), idx, type)
	}

	return this._helper_word(numberStart, numberDone)
}
module.exports.number_length = module.exports._helper_word_length
