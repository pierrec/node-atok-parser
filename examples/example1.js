function myParser (options) {
	function handler (num) {
		// The options are set from the myParser function parameters
		// self is already set to the Parser instance
		if ( options.check && !isFinite(num) )
			return self.emit('error', new Error('Invalid float: ' + num))

		self.emit('data', num)
	}
	// the float() and whitespace() helpers are provided by atok-parser
	atok.float(handler)
	atok.whitespace()
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

// Parse a valid float
var validfloat = p.parse('123.456 ')
console.log('parsed data is of type', typeof validfloat, 'value', validfloat)

// The following data will produce an invalid float and an error
p.on('error', console.error)
var invalidfloat = p.parse('123.456e1234 ')