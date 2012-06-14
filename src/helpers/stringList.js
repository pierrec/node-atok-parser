// Parse a list of strings
// e.g. ('a'|"b") -> [ 'a', 'b' ] with start=(, end=) and sep=|
// In case of error, it calls the handler with an error object
module.exports.stringList = function (/* start, end, sep, handler */) {
	var args = this._helper_setArguments(['(', ')', ','], arguments, 'stringList')
	var start = args[0]
	var end = args[1]
	var sep = args[2]
	var handler = args[3]

	var atok = this
	var resetMarkedOffset = false	// First helper to set the markedOffset value?

	var props = atok.getProps()
	var isQuiet = props.quiet
	var isIgnored = props.ignore

	var list = []
	
	function stringList_start () {
		// Prevent buffer slicing by atok
		resetMarkedOffset = (atok.markedOffset < 0)
		if (resetMarkedOffset) atok.markedOffset = atok.offset
	}
	function stringList_done () {
		if (!isIgnored) handler(list, -1, null)
		if (resetMarkedOffset) atok.markedOffset = -1
		list = []
	}
	function stringList_acc (token) {
		list.push(token)
	}
	function stringList_error () {
		var err = new Error('Parse error')
		err.list = list
		list = err
		stringList_done()
	}

	return atok
		.groupRule(true)
		.ignore().quiet(true).next().break().trim(true)
		.continue( 0, atok._helper_continueFailure(props, 9, 0) )
			.addRule(start, stringList_start)
		
		// Ignore whitespaces: start->first item or separator->next item
		.continue(-1)
			.whitespace()
		// Check for the end of the list
		.setProps(props).ignore().quiet(true)
		.continue( atok._helper_continueSuccess(props, 7, -2) )
			.addRule(end, stringList_done)
		.ignore(isIgnored).quiet(isQuiet)
		.next().break()
		.continue(2)
			// Check for a double quoted string
			.string('"', stringList_acc)
			// Check for a single quoted string
		.continue(1)
			.string("'", stringList_acc)
		.ignore().quiet()

		// If nothing matched at this point -> parse error
		.continue(
			atok._helper_continueSuccess(props, 4, -5)
		,	atok._helper_continueFailure(props, 4, -5)
		)
			.addRule(stringList_error)
		// Ignore whitespaces: current item->separator
		.continue(-1)
			.whitespace()
		// If a separator is found, go back to check for more strings
		.continue(-7).ignore(true)
			.addRule(sep, 'stringList-separator')
		// Check for the end of the list
		.setProps(props).ignore().quiet(true)
		.continue(
			atok._helper_continueSuccess(props, 1, -8)
		)
			.addRule(end, stringList_done)
		// If no sep/end found -> parse error
		.continue(
			atok._helper_continueSuccess(props, 0, -9)
		,	atok._helper_continueFailure(props, 0, -9)
		)
			.addRule(stringList_error)

		.setProps(props)
		.groupRule()
}
