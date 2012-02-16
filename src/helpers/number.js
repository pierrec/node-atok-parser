// positive integers
var numberStart = { start: '0', end: '9' }
module.exports.number = function () {
	var args = this._helper_setDelimiterArguments(arguments, 'number')
	var delimiters = args[0], handler = args[1]

	function done (data) {
		handler(Number(data), -1, null)
	}

	function doneDelim (token, idx, type) {
		var num = Number(token)
		handler( isFinite(num) ? num : token, idx, type )
	}

	this
		.saveProps('number')
		.trimLeft()

	if (delimiters)
		// Delimiters known, use this as it is much faster
		this
			.addRule(
				numberStart
			, delimiters.length > 1 ? { firstOf: delimiters } : delimiters[0]
			, doneDelim
			)
	else
		this
			._helper_word(null, done, numberStart)
	
	return this.loadProps('number')
}
