atok
	.whitespace()
	.number()
	.whitespace()
	.word()
	.whitespace()
	.string({ start: '~$', end: '~$'})
	.whitespace()
	.float()
	.whitespace()
	.on('data', function (token, idx, type) {
		self.emit('data', token, idx, type)
	})
	.on('error', function (err, token) {
		// Add some positioning info to the error
		// Error, extracted token, neighbour size
		var newerr = self.trackError(err, token, 3)
		self.emit('error', newerr)
	})