var Parser = require('./simple_CSV')

var i = 0
var p = new Parser({ separator: '\t' })
	.on('error', console.log)
	.on('data', function (res) {
		console.log('%d:', ++i, res)
	})
	.track(true)
	// .track()

// p.write('a\tb\naa\tbb\nerror\n')
p.write('a\tb\naa\tbb\n')
// Simulated error
p.write('error\n')