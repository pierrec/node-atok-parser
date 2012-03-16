// Parse a list of strings
// e.g. ('a'|"b") -> [ 'a', 'b' ] with start=(, end=) and sep=|
module.exports.stringList = function (/* start, end, sep, handler */) {
	var args = this._helper_setArguments(['(', ')', ','], arguments, 'stringList')
	var end = args[1]
	var endLength = end.length
	var handler = args[3]

	var atok = this
	var list = null

	function stringListAcc (token) {
		console.log('ACC', token)
		list.push(token)
	}
	function stringListCheckDone (s, start) {
		// TODO no substr -> atok support for heteregenous array content
		// NB. end cannot be empty
		// Invalid rule if: no start or no end found (invalid one or not received yet)
		return list === null || s.substr(start, endLength) !== end ? -1 : endLength
	}
	function stringListDone () {
		handler(list)
		list = null
	}

	return atok
		.saveProps('stringList')
		.trim(true).next()

		// Check the start of the list
		.continue(1)
			.addRule(args[0], function stringListInit () { list = []; console.log('INIT', args) })
		// Start of list not found, go at the end
		.continue(7)
			.noop()
		// Ignore whitespaces: start->first item or separator->next item
		.continue(0)
			.whitespace()
		// Check for a double quoted string
		.escaped(true)
		.continue(3)
			.addRule('"', '"', stringListAcc)
			// Start of string found...wait for its end
		.continue(-2)
			.wait('"')
		// Check for a single quoted string
		.continue(1)
			.addRule("'", "'", stringListAcc)
			// Start of string found...wait for its end
		.continue(-2)
			.wait("'")
		.escaped()
		// Ignore whitespaces: current item->separator
		.continue(0)
			.whitespace()
		// If a separator is found, go back to check for more strings
		.continue(-7)
			.ignore(true)
				.addRule(args[2], 'stringList-separator')
			.ignore()
		// Check the end of the list
		.loadProps('stringList')
			.addRule(stringListCheckDone, stringListDone)
}
