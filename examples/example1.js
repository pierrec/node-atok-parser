function myParser (options) {
	function handler (num) {
		// The options are set from the myParser function parameters
		// self is already set to the Parser instance
		self.emit('data', num)
	}
	function errorHandler () {
		self.emit('error', new Error('Invalid float at ' + atok.offset + ': "' + atok.slice(atok.offset) + '"'))
	}
	// the float() and whitespace() helpers are provided by atok-parser
	atok
		.continue(0, 1) // go to whitespace() if float found, to errorHandler otherwise
			.float(handler)
		.continue(-2, -2) // go back to float() after whitespace()
			.whitespace()
		.continue()
	// if we get here, it means that there is no (valid) float:
	// emit an error if the option is set
	// also break out as atok would loop on the current position
		.break(true)
			.addRule( options.check && errorHandler )
		.break()
}

var Parser = require('..').createParser(myParser)

// Add the #parse() method to the Parser
Parser.prototype.parse = function (data) {
	var res

	// One (silly) way to make parse() look synchronous...
	this.once('data', function (data) {
		res = data
	})
	this.write(data)

	// ...write() is synchronous
	return res
}

// Instantiate a parser
var p = new Parser({ check: true })
p.on('error', console.error)

// Parse a valid float
var validfloat = p.parse('123.456 ')
console.log('parsed data is of type', typeof validfloat, 'value', validfloat)
var validfloat = p.parse('123.456e1234 ')
console.log('parsed data is of type', typeof validfloat, 'value', validfloat)

// The following data will produce an invalid float and an error
var invalidfloat = p.parse('123.456ev1234 ')