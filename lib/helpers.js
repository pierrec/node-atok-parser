// Spaces, tabs, line breaks
// Ignore by default, unless a handler is specified
var whitespace = [' ','\t','\n','\r']
exports.whitespace = function (handler) {
	if (arguments.length === 0) handler = 'whitespace'
	return this.atok
		.ignore( arguments.length === 0 )
			.addRule(whitespace, handler)
		.ignore()
}

// Letters, digits and underscore
// 65-90 97-122, 48-57, 95
var wordStart = { start: 'aA0_', end: 'zZ9_' }
exports.word = function (terminators, handler) {
	if (arguments.length === 0) {
		handler = 'word'
	} else if (arguments.length === 1) {
		handler = terminators
		terminators = null
	}
	return terminators
		? this.atok
				.addRule(wordStart, { firstOf: terminators }, handler)
		: this.atok
				.continue(-1)
					.addRule(wordStart, handler)
				.continue()
}

// positive integers
var numberStart = { start: '0', end: '9' }
exports.number = function (terminators, handler) {
	var atok = this.atok
	var mode = atok._bufferMode

	if (arguments.length === 0) {
		handler = 'number'
	} else if (arguments.length == 1) {
		handler = terminators
		terminators = null
	}

	function _terminatorStringHandler (token) {
		var num = Number(token)
		handler( isFinite(num) ? token : num, -1, null )
	}
	function _terminatorHandler (token) {
		var num = Number( token.toString() )
		handler( isFinite(num) ? token : num, -1, null )
	}

	var current = ''
	function _digitStringHandler (token) {
		current += token
	}
	function _digitHandler (token) {
		current += token.toString()
	}

	return terminators
		? atok
				.trimLeft()
					.addRule(
						numberStart
					, { firstOf: terminators }
					, mode ? _terminatorHandler : _terminatorStringHandler
					)
				.trimLeft(true)
		: atok
				.trimLeft().continue(-1)
					.addRule(
						numberStart
					, mode ? _digitHandler : _digitStringHandler
					)
				.trimLeft(true).continue()
				// Must wait until we are sure we no longer have digits
				.quiet(true)
					.addRule(1, function () {
						_terminatorHandler(current)
					})
					.addRule(-1, function () {
						atok.seek(-1)
						_terminatorHandler(current)
					})
				.quiet()
}