var numString = '123.456 '

var data= ''
for (var i = 0; i < 10; i++)
	data += numString

function floatListParser () {
	atok.float()
}

var Parser = require('..').createParser(floatListParser)
var p = new Parser

exports.compare = {
	"split().Number()" : function () {
		data.split(' ').forEach(Number)
	},
"helper.float()" : function () {
		p.write(data)
	}
}
require("bench").runMain()
