var numString = '123.456 '

var data= ''
for (var i = 0; i < 2; i++)
	data += numString

function floatListParser () {
	atok.float()
		.ignore(true)
		.addRule(1, 'space')
		.on('data', console.log)
}

var Parser = require('..').createParser(floatListParser)
var p = new Parser

console.time('split')
data.split(' ').forEach(Number)
console.timeEnd('split')

p.debug(true)
p.on('debug', console.log)
console.time('parser')
p.write(data)
console.timeEnd('parser')
