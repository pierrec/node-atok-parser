#!/usr/bin/env node


var EventEmitter = require('events').EventEmitter
var EV = require('..')

var bench = require('visualbench')( EV.version + ':add' )

function test () {
	return 'test'
}

var nodeEV = new EventEmitter()
var ev = new EV({ match: 2 })

// Avoid warnings
nodeEV.setMaxListeners(0)
ev.setMaxListeners(0)

exports.compare = {
	"ev": function () {
		ev.addListener('match', test)
	}
, "EventEmitter": function () {
		nodeEV.addListener('match', test)
	}
}

bench.runMain()

// benchmarking node-ev/bench/bench_add.js
// Please be patient.
// { node: '0.6.10',
//   v8: '3.6.6.20',
//   ares: '1.7.5-DEV',
//   uv: '0.6',
//   openssl: '1.0.0e' }
// Scores: (bigger is better)

// node EventEmitter
// Raw:
//  > 6080.919080919081
//  > 5419.580419580419
//  > 5.363528009535161
//  > 6302.697302697303
//  > 6194.805194805195
// Average (mean) 4800.673105202307

// ev
// Raw:
//  > 1479.5613160518444
//  > 1394.6053946053946
//  > 1151.1285574092246
//  > 1193.3115823817293
//  > 1061.938061938062
// Average (mean) 1256.1089824772512

// Winner: node EventEmitter
// Compared with next highest (ev), it's:
// 73.83% faster
// 3.82 times as fast
// 0.58 order(s) of magnitude faster
