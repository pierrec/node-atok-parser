#!/usr/bin/env node


var listenersNum = process.argv[2] || 2

var EventEmitter = require('events').EventEmitter
var EV = require('..')

var bench = require('visualbench')( 'emit:' + listenersNum, EV.version )

function test () {
	return 'test'
}

var nodeEV = new EventEmitter()
var ev = new EV({ match: 2 })
var evNoInit = new EV()
evNoInit.emit('match', 1, 2)

for (var i = 0; i < listenersNum; i++) {
	nodeEV.addListener('match', test)
	ev.addListener('match', test)
	evNoInit.addListener('match', test)
}

exports.compare = {
	"ev.emit": function () {
		ev.emit('match', 1, 2)
	}
, "ev": function () {
		ev.emit_match(1, 2)
	}
, "ev no init": function () {
		evNoInit.emit_match(1, 2)
	}
, "EventEmitter": function () {
		nodeEV.emit('match', 1, 2)
	}
}

bench.runMain()

// benchmarking node-ev/bench/bench_emit.js
// Please be patient.
// { node: '0.6.10',
//   v8: '3.6.6.20',
//   ares: '1.7.5-DEV',
//   uv: '0.6',
//   openssl: '1.0.0e' }
// Scores: (bigger is better)

// ev
// Raw:
//  > 23481.51848151848
//  > 24086.913086913086
//  > 24065.934065934067
//  > 23443.556443556445
//  > 22796.203796203798
// Average (mean) 23574.825174825175

// ev.emit
// Raw:
//  > 17576.42357642358
//  > 17845.154845154844
//  > 17777.222777222778
//  > 17482.517482517484
//  > 17137.86213786214
// Average (mean) 17563.836163836164

// ev no init
// Raw:
//  > 6995.004995004995
//  > 7161.838161838162
//  > 7157.842157842158
//  > 7217.782217782218
//  > 7095.904095904096
// Average (mean) 7125.674325674326

// node EventEmitter
// Raw:
//  > 5459.54045954046
//  > 5474.525474525474
//  > 5430.569430569431
//  > 5427.572427572428
//  > 5354.645354645355
// Average (mean) 5429.370629370629

// Winner: ev
// Compared with next highest (ev.emit), it's:
// 25.5% faster
// 1.34 times as fast
// 0.13 order(s) of magnitude faster

// Compared with the slowest (node EventEmitter), it's:
// 76.97% faster
// 4.34 times as fast
// 0.64 order(s) of magnitude faster

