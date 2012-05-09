/**
	processed by #add()
	//var DEBUG=true

	processed by #build(): //if first then //include
	//if(DEBUG) //endif
	//if(!DEBUG) // endif
	//if(DEBUG) //include("path/to/file") //endif

	//include("path/to/file")
**/

var EventEmitter = require('events').EventEmitter
var util = require('util')

var async = require('async')

var debug = require('debug')('include')
var FileModule = require('./file')
var File = FileModule.File
var normalize = FileModule.normalize

module.exports = Include

function Include (options) {
	var self = this

	this.ids = {}			// Hash of files (full path file name)
	this.roots = []		// Files with no parents
	this.deps = []		// List of File items depending on other File items
	this.nodeps = []	// List of independent File items

	// Load all files and their dependencies
	this.queue = async.queue(addWorker, 1)
	this.queue.drain = setParents

	function addWorker (data, callback) {
		debug('addWorker %s', data)
		// Already in collection, nothing to do
		if ( self.ids[data] ) return callback()

		// Add the item to the list
		debug('adding %s', data)
		var file = new File(data, options)

		// Init the file
		file.init(function (err) {
			if (err) return self.emit('error', err)

			debug('=> added', file.id)
			// debug('=> added', file.data)
			self.ids [file.id] = file
			if (file.deps.length > 0) {
				self.deps.push(file)
				async.forEach(
					file.deps
				, function (item, cb) {
						self.add(item)
						cb()
					}
				, callback
				)
			} else {
				self.nodeps.push(file)
				callback()
			}
		})
	}
	// Once all files are loaded, set their parents
	function setParents () {
		var q = async.queue(processFile, 1)
		q.drain = function () { self.emit('drain') }

		// Process files with no dependency first
		self.nodeps.forEach( q.push )

		function processFile (item, cb) {
			debug('dep:', item.id)
			// Add files with no dependency left to be processed
			self.deps
				.forEach(function (file) {
					if ( file.count > 0 && file.deps.indexOf(item.id) >= 0 ) {
						item.parents.push(file.id)
						file.count--
						debug('file %s -> %d', file.id, file.count)
						if (file.count === 0) q.push(file)
					}
				})
			cb()
		}
	}
}
util.inherits(Include, EventEmitter)

// Add a file
Include.prototype.add = function (data, callback) {
	this.queue.push( normalize(data), callback )
}

// Get a file by id
Include.prototype.get = function (id) {
	return this.ids[id]
}

// Build the root files content
Include.prototype.build = function (callback) {
	var self = this

	// console.log( require('util').inspect(this, false, 6) )
	this.roots = this.deps.concat(this.nodeps)
		.filter(function (f) {
			return f.parents.length === 0
		})
	this.roots.forEach(function (file) {
		file.build(self)
	})
	process.nextTick( callback )
}