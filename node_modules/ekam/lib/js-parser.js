var atokParser = require('atok-parser')

var JSParser = atokParser.createParser('./jsParser', 'scope,options')

// Expose the AST
JSParser.prototype.ast = require('./js-ast')

module.exports = JSParser