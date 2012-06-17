options = options || {}

if (options.esc)
	atok.string(options.start, options.end, options.esc, 'string')
else
	atok.string(options.start, options.end, undefined, 'string')

atok
	.on('data', function (token, idx, type) {
		self.emit('data', token, idx, type)
	})
	.on('error', function (err, token) {
		// Add some positioning info to the error
		// Error, extracted token, neighbour size
		var newerr = self.trackError(err, token, 3)
		self.emit('error', newerr)
	})