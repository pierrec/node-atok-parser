/*
 * ekam command line tests
 */
var assert = require('assert')
var fs = require('fs')
var path = require('path')
var child_process = require('child_process')

describe('command line', function () {
	var files = ['build.js','build.json']
	var ekamCommand = path.resolve(__dirname, '../bin/ekam')

	function cleanup (done) {
		files.forEach(function (file) {
			var f = path.resolve(__dirname, file)
			if ( path.existsSync(f) ) fs.unlinkSync(f)
		})
		done()
	}

	beforeEach(cleanup)
	afterEach(cleanup)

	describe('--init', function () {
		it('should build init files', function (done) {
			child_process.exec(
				ekamCommand + ' --init'
			,	function () {
					assert.equal( files.every(path.existsSync), true )

					done()
				}
			)
		})

		it('should overwrite existing init files', function (done) {
			child_process.exec(
				ekamCommand + ' --init'
			,	function () {
					child_process.exec(
						ekamCommand + ' --init --force'
					,	function () {
							assert.equal( files.every(path.existsSync), true )

							done()
						}
					)
				}
			)
		})

		it('should error on existing init files', function (done) {
			child_process.exec(
				ekamCommand + ' --init'
			,	function (err, stdout, stderr) {
					child_process.exec(
						ekamCommand + ' --init'
					,	function () {
							assert.equal( files.every(path.existsSync), true )
							assert.equal( stderr.length > 0, true )

							done()
						}
					)
				}
			)
		})
	})
})