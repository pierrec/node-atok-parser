var numString = '123.456 '

var data= ''
// for (var i = 0; i < 2; i++)
for (var i = 0; i < 100000; i++)
	data += numString

var res = []
function floatListParser (res) {
	atok
		.continue(0)
		.float(function (n) { res.push(n) })
		.continue()
		.ignore(true)
		.addRule(' ', 'space')
		// .on('data', console.log)
}

var Parser = require('..').createParser(floatListParser, 'res')
var p = new Parser(res)

console.time('split')
var res2 = data.split(' ').map(Number)
res2.pop()
console.timeEnd('split')

// p.debug(console.log)
console.time('parser')
p.write(data)
console.timeEnd('parser')

require('assert').deepEqual(res, res2)
