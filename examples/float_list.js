/**
 * Parse a whitespace separated list of floats, up to maxCount
 * The parser content is hold in a function
 */
function ParserContent () {
	/**
	 * options.maxCount
	 */
	var maxCount = options.maxCount
	var stack = []

	function save (data) {
		if (stack.push(data) >= maxCount) {
			self.emit_data(stack)
			stack = []
		}
	}

	atok
		// Parse a float, emit its value as a [data] event and continue with the rules
		.continue(0)
			.float(save)
		// Skip whitespaces and go back to the beginning when matched
		.continue( -atok.float_length )
			.whitespace()
		.continue()
}

// Build the float list parser
var Parser = require('..').createParser(ParserContent, 'options')
var p = new Parser({ maxCount: process.argv[2] || 5 })

p.on('data', console.log)
p.on('error', console.error)

// The list should only parse maxCount items
p.write('1.1 2.2 3.3 4.4 5.5 6.6 7.7 8.8 9.9 10.10 11.11 ')
