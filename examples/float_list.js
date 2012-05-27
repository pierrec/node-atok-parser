/**
 * Parse a whitespace separated list of floats, up to maxCount
 * The parser content is hold in a function
 * NB. the parser function loses its context when used by createParser()
 */
function ParserContent (options) {
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

	function end () {
		self.emit_data(stack)
		stack = null
	}

	atok
		// Parse a float, emit its value as a [data] event and continue with the rules
		.float(save)
		// Skip whitespaces and go back to the beginning when matched
		// .continue(-1)
			.whitespace()

		// Emit the remaining data
		.on('end', end)
}

// Build the float list parser
var Parser = require('..').createParser(ParserContent)
var p = new Parser({ maxCount: process.argv[2] || 5 })

p.on('debug', console.log)
p.on('data', console.log)
p.on('error', console.error)
// p.debug(true)

// The list should parse chunks of size maxCount
p.end('1.1 2.2 3.3 4.4 5.5 6.6 7.7 8.8 9.9 10.10 11.11')
