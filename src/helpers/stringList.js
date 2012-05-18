// Parse a list of strings
// e.g. ('a'|"b") -> [ 'a', 'b' ] with start=(, end=) and sep=|
// TODO: handle parse errors
module.exports.stringList = function (/* start, end, sep, handler */) {
	var args = this._helper_setArguments(['(', ')', ','], arguments, 'stringList')
	var start = args[0]
	var end = args[1]
	var sep = args[2]
	var endLength = end.length
	var handler = args[3]

	var list = []

	function stringListAcc (token) {
		list.push(token)
	}
	function stringListDone () {
		_helper_done(0)
		list = []
	}

	function wait (c, jump) {
		return atok
			// Check string start...
			.continue(0, 2)
			.ignore(true)
				.addRule(c, c + '-stringStart-stringList')
			.ignore()
			// ...start found, wait for the end of the string
			.continue( jump + 1 ).escaped(true)
				.addRule('', c, stringListAcc)
			.escaped()
			.break(true).continue(-2).ignore(true)
				.addRule(c + '-wait-stringList')
			.break().ignore()
	}

	var helperId = '_helper_stringList'
	var firstMatch = start
//var res = "[].concat(list)"
//include("../helpers_common_start.js")

	// End detection does not require use of the [end] event
	.off('end', _helper_end)

	// Ignore whitespaces: start->first item or separator->next item
	.continue(-1)
		.whitespace()
	// Check for the end of the list
	.continue()
		.addRule(end, stringListDone)
	// Check for a double quoted string
	wait('"', 4)
		// Check for a single quoted string
	wait("'", 1)

	atok
	// If nothing matched at this point -> parse error
	.continue()
		.addRule(_helper_doneCancel)
	// Ignore whitespaces: current item->separator
	.continue(-1)
		.whitespace()
	// If a separator is found, go back to check for more strings
	.continue(-11)
		.ignore(true)
			.addRule(sep, 'stringList-separator')
		.ignore()
	.continue()
	// Check for the end of the list
		.addRule(end, stringListDone)
	// If no sep/end found -> parse error
		.addRule(_helper_doneCancel)

//include("../helpers_common_end.js")
}
module.exports.stringList_length = '3 + 2 * whitespace_length + 2 * wait_length'
