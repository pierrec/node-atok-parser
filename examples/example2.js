// Parse a whitespace separated list of floats
var myParser = [
	'atok.float(function (n) { self.emit("data", n) })'
,	'atok.continue(null, -2)'
,	'atok.whitespace()'
]

var Parser = require('..').createParser(myParser)
var p = new Parser

p.on('data', function (num) {
	console.log(typeof num, num)
})
p.end('0.133  0.255')