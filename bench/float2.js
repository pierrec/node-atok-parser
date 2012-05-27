var numString = '123.456 '

var data= ''
for (var i = 0; i < 100000; i++)
	data += numString

function floatListParser () {
	atok.float()
		.ignore(true)
		.addRule(1, 'space')
}

var Parser = require('..').createParser(floatListParser)
var p = new Parser

console.time('split')
data.split(' ').forEach(Number)
console.timeEnd('split')

// p.atok.on('data', console.log)
console.time('parser')
p.write(data)
console.timeEnd('parser')
