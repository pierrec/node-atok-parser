var fs = require('fs')
var path = require('path')

var inherits = require('inherits')
var debug = require('debug')('file')

// Normalize the file name
function normalize (file) {
	return path.resolve(file)
}

// Lazy load the list of available parsers
var ParsersList = {}

fs.readdirSync( __dirname )
	.forEach(function (f) {
		var ext = f.match(/^(.*)-parser\.js$/)
		if (!ext) return

		function load () {
			return require('./' + f)
		}
		ParsersList.__defineGetter__( ext[1], load )
	})

module.exports = { File: File, normalize: normalize }

function File (file, options) {
	options = options || {}
	
	this.id = normalize(file)
	this.base = path.basename( this.id )
	this.path = path.dirname( this.id )

	this.data = []				// File AST
	this.content = null		// File content
	this.deps = []				// List of dependent files
	this.parents = []			// List of files depending on it
	this.count = 0				// Number of dependent files
	this.ext = path.extname(this.id).substr(1)

	// Parser generating the AST
	var Parser = ParsersList[ this.ext ]
	this.parser = Parser ? new Parser(this, options) : null
}

// Build the AST tree
File.prototype.init = function (callback) {
	var self = this
	var file = this.id
	var parser = this.parser

	debug('Processing ' + file + '...')

	if (!parser)
		return process.nextTick( callback )
	
	function done (err) {
		parser.removeListener('end', done)
		parser.removeListener('error', done)

		self.count = self.deps.length
		callback(err)
	}
	parser
		.on('end', done)
		.on('error', done)
	
	fs.createReadStream(file).pipe(parser)
}

// Build the file content
File.prototype.build = function (list) {
	debug('Building %s', this.id)
	// console.log( require('util').inspect(this.data, false, 6) )
	this.content = this.parser ? this.parser.ast.build(this.data, list) : null
}