// Parse a list of strings
// e.g. ('a'|"b") -> [ 'a', 'b' ] with start=(, end=) and sep=|
module.exports.stringList = function (/* start, end, sep, handler */) {
	var args = this._helper_setArguments(['(', ')', ','], arguments, 'stringList')
	var handler = args[3]

	var atok = this
	var list

	function stringListAcc (token) {
		list.push(token)
	}

	return atok
		.saveProps('stringList')
		.trim(true).next()

		// Check the start of the list
		.continue(0)
			.addRule(args[0], function stringListInit () { list = [] })
		// Ignore whitespaces
			.whitespace()
		// Check for a double quoted string
		.escaped(true)
		.continue(1)
			.addRule('"','"', stringListAcc)
		// Check for a single quoted string
		.continue(0)
			.addRule("'","'", stringListAcc)
		.escaped()
		// Ignore whitespaces
			.whitespace()
		// If a separator is found, go back to check for more strings
		.continue(-5)
			.ignore(true)
				.addRule(args[2], 'stringList-separator')
			.ignore()
		// Check the end of the list
		.loadProps('stringList')
			.addRule(args[1], function stringListDone () {
				handler(list)
			})
}
