// positive integers
var numberStart = { start: '0', end: '9' }
module.exports.number = function (/* delimiters, handler */) {
	var args = this._helper_setArguments([null], arguments, 'number')
	var delimiters = args[0], handler = args[1]

	function done (token, idx, type) {
		var num = Number(token)
		handler( isFinite(num) ? num : token, idx, type )
	}

	return this._helper_word(delimiters, done, numberStart)
}
