/*
 * Helpers misc tests
**/
var assert = require('assert')
var fs = require('fs')
var path = require('path')

var atokParser = require('..')
var options = {}

describe('Parser Helpers', function () {
  describe('must have their length set', function () {
    
    fs.readdirSync( path.resolve( __dirname, '../src/helpers' ) )
      .forEach(function (helperFile) {
        var helper = helperFile.replace('.js', '')

        it(helper, function (done) {
          var len = atokParser.Helpers[helper + '_length']

          assert.notEqual( '' + len, 'NaN', helper + '_length === NaN' )
          assert.equal( typeof len, 'number' )
          done()
        })
      })
    
  })
})