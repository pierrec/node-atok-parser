atok
	.continue(0) // Rules are executed sequentially
	.whitespace()
	.number()
	.whitespace()
	.word()
	.whitespace()
	.string()
	.whitespace()
	.float()
	.whitespace()
	.match('(', ')')
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