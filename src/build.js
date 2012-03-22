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
	
	// Evaluate the helpers lengths
	var target = fstream.Writer({
		path: path.resolve( __dirname, '../lib/helpers.js' )
	, flags: 'a'
	})

	var _postBuildTask_list = Object.keys(Helpers)
		.filter(function (item) {
			return /_length$/.test(item) && typeof Helpers[item] === 'string'
		})
	var _postBuildTask_item

	var v, i = 0

	while ( _postBuildTask_list.length ) {
		_postBuildTask_item = _postBuildTask_list[i]
		// console.log(i, _postBuildTask_item)

		with (Helpers) { // with!!!
			v = eval( eval( _postBuildTask_item ) ) // double eval!!!
		}
		if ( isFinite(v) ) {
			target.write( 'module.exports.' + _postBuildTask_item + ' = ' + v + '\n' )
			_postBuildTask_list.splice(i, 1)
		} else {
			i = i < _postBuildTask_list.length - 1 ? i + 1 : 0
		}
	}

	target.end()
}
