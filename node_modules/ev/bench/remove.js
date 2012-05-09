#!/usr/bin/env node


var EventEmitter = require('events').EventEmitter
var EV = require('..')

var bench = require('visualbench')( EV.version + ':remove' )
var listenersNum = bench.STEPS_PER_LAP

function test () {
	return 'test'
}

var nodeEV = new EventEmitter()
var ev = new EV({ match: 2 })

// Avoid warnings
nodeEV.setMaxListeners(0)
ev.setMaxListeners(0)

for (var i = 0; i < listenersNum; i++) {
	nodeEV.addListener('match', test)
	ev.addListener('match', test)
}

exports.compare = {
	"ev": function () {
		ev.removeListener('match', test)
	}
, "EventEmitter": function () {
		nodeEV.removeListener('match', test)
	}
}

bench.runMain()

// benchmarking node-ev/bench/bench_remove.js
// Please be patient.
// { node: '0.6.10',
//   v8: '3.6.6.20',
//   ares: '1.7.5-DEV',
//   uv: '0.6',
//   openssl: '1.0.0e' }
// Scores: (bigger is better)

// ev
// Raw:
//  > 43475.52447552448
//  > 43443.556443556445
//  > 42987.01298701299
//  > 43501.4985014985
//  > 35919.080919080916
// Average (mean) 41865.33466533466

// node EventEmitter
// Raw:
//  > 9433.566433566433
//  > 9518.481518481518
//  > 9369.63036963037
//  > 9537.462537462538
//  > 7583.416583416583
// Average (mean) 9088.511488511487

// Winner: ev
// Compared with next highest (node EventEmitter), it's:
// 78.29% faster
// 4.61 times as fast
// 0.66 order(s) of magnitude faster
