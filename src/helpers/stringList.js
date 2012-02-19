// Parse a list of strings
// e.g. ('a'|'b') -> [ 'a', 'b' ] with start=(, end=) and sep=|
module.exports.stringList = function (/* start, end, sep, handler */) {
	var args = this._helper_setArguments(['(', ')', ','], arguments, 'stringList')
	var handler = args[3]

	var atok = this
	var list

	return atok
		.saveProps('stringList')
		.trim(true).next()

		.continue(0)
			.addRule(args[0], function () { list = [] })
			.whitespace()
		.escaped(true)
		.continue(1)
			.addRule('"','"', function (token) { list.push(token) })
		.continue(0)
			.addRule("'","'", function (token) { list.push(token) })
		.escaped()
			.whitespace()
		.continue(-5)
			.ignore(true)
				.addRule(args[2], 'separator-stringList')
			.ignore()
		.loadProps('stringList')
			.addRule(args[1], function () {
				handler(list)
			})

}
