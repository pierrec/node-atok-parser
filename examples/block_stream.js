/**
	Stream data in blocks
 */
function myParser (size) {
	if (typeof size !== 'number')
		throw new Error('Invalid block size: ' + size)

	function isEnd () {
		return atok.ending ? atok.length - atok.offset : -1
	}

	atok
		.trim()
		.addRule(size, function (data) {
			self.emit('data', data)
		})
		.addRule('', isEnd, function (data) {
			var len = data.length

			if (typeof data === 'string') {
				var lastBlock = data + new Array(size - len + 1).join('0')
			} else {
				var lastBlock = new Buffer(size)
				lastBlock.fill(0, len)
				data.copy(lastBlock, 0)
			}
			self.emit('data', lastBlock)
		})
		.on('end', function () {
			self.emit('end')
		})
}

var Parser = require('..').createParser(myParser)
var p = new Parser(2)

p
	.on('data', console.log)
	.end('aabbccd')
