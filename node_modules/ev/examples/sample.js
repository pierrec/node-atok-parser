var EV = require('..')
var ev = new EV({ match: 2 })

function test (a) {
	console.log('received', a)
}

ev.on('match', test)
ev.emit('match', 'standard emit') // 
ev.emit_match('shortcut emit!')
