build(
	{
		"input": {
			"include": "**/*.js"
		, "exclude": "build.js"
		}
	,	"output": {
			"path": "../lib"
		, "mode": "0644"
		, "clean": true
		}
	}
, postBuildTask
)

var path = require('path')
var fstream = require('fstream')

function postBuildTask () {
	var Helpers = require( path.resolve( __dirname, '..' ) ).Helpers
	
	// Evaluate the helpers lengths:
	// this is required since most helpers rely on other helpers
	var target = fstream.Writer({
		path: path.resolve( __dirname, '../lib/helpers.js' )
	, flags: 'a'
	})

	// List of length properties to process
	var _postBuildTask_list = Object.keys(Helpers)
		.filter(function (item) {
			return /_length$/.test(item) && typeof Helpers[item] === 'string'
		})
	var _postBuildTask_item

	var v

	while ( _postBuildTask_list.length ) {
		_postBuildTask_item = _postBuildTask_list.shift()
		// console.log(i, _postBuildTask_item)

		// Get the expression and eval it in the context of Helpers (that way other
		// helper lengths are accessed directly by their name)
		with (Helpers) { // with!!!
			v = eval( eval( _postBuildTask_item ) ) // double eval!!!
		}
		if ( isFinite(v) ) {
			// All lengths are known
			target.write( 'module.exports.' + _postBuildTask_item + ' = ' + v + '\n' )
		} else {
			// Still missing some lengths, add to the back of the queue
			// Note. there is no check for mutual dependency...
			_postBuildTask_list.push( _postBuildTask_item )
		}
	}

	target.end()
}
