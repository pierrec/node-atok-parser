// Parse a list of strings
// e.g. ('a'|"b") -> [ 'a', 'b' ] with start=(, end=) and sep=|
module.exports.stringList = function (/* start, end, sep, handler */) {
	var args = this._helper_setArguments(['(', ')', ','], arguments, 'stringList')
	var start = args[0]
	var end = args[1]
	var endLength = end.length
	var handler = args[3]

	var atok = this
	var list = null

	var props = atok.getProps('quiet', 'ignore')
	var isQuiet = props.quiet
	var isIgnored = props.ignore

	function stringListAcc (token) {
		list.push(token)
	}
	function stringListCheckDone (s, offset) {
		// TODO no substr -> atok support for heteregenous array content
		// NB. end cannot be empty
		// Invalid rule if: no start or no end found (invalid one or not received yet)
		return list === null || s.substr(offset, endLength) !== end ? -1 : endLength
	}
	function stringListDone () {
		if (!isIgnored) handler(list)
		list = null
	}

	return atok
		.saveProps('stringList')
		.trim(true).next()

		// Check the start of the list
		// Start of list not found, go to the end
		.continue( 0, 2*atok.whitespace_length + 2*atok.wait_length + 2 )
			.addRule(start, function stringListInit () { list = [] })
		// Ignore whitespaces: start->first item or separator->next item
		.continue( -atok.whitespace_length )
			.whitespace()
		// Check for a double quoted string
		.escaped(true)
		.continue( atok.wait_length )
			.wait('"', '"', stringListAcc)
		// Check for a single quoted string
		.continue(0)
			.wait("'", "'", stringListAcc)
		.escaped()
		// Ignore whitespaces: current item->separator
		.continue( -atok.whitespace_length )
			.whitespace()
		// If a separator is found, go back to check for more strings
		.continue( -(2*atok.whitespace_length + 2*atok.wait_length + 1) )
			.ignore(true)
				.addRule(args[2], 'stringList-separator')
			.ignore()
		// Check the end of the list
		.loadProps('stringList')
		.quiet(true).ignore()
			.addRule(stringListCheckDone, stringListDone)
		.quiet(isQuiet).ignore(isIgnored)
}
module.exports.stringList_length = '3 + 2 * whitespace_length + 2 * wait_length'
