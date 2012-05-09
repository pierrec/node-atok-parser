var uglify = require('uglify-js')
	, jsp = uglify.parser
 	, pro = uglify.uglify
var debug = require('debug')('js-ast')

module.exports = {
	build: build
// Available AST nodes
, Var: ast_var
, If: ast_if
, Include: ast_include
, Uglify: ast_uglify
}
// Walk the AST and evaluate the nodes
function build (data, cache, scope) {
	scope = scope || { var: '' }

	return data
		.map(function (item) {
			return typeof item === 'string'
				? item
				: item.run(cache, scope)
		})
		.join('')
}
/**
 * AST nodes definition
 * they must all have a #run() method returning their evaluated content
**/
// var
function ast_var (data) {
	this.type = 'var'
	this.data = data
}
ast_var.prototype.run = function (cache, scope) {
	debug('var:', this.data, '->', scope.var)
	scope.var += (scope.var.length > 0 ? ',' : '') + this.data
	return ''
}
// if
function ast_if (cond) {
	this.type = 'if'
	this.cond = ';!!(' + cond + ')'
	this.data = []
	this.else = []
}
ast_if.prototype.run = function (cache, scope) {
	debug('if:', 'var ' + scope.var + this.cond)
	// Note: the scope is shared accross the whole set of dependencies
	return scope.var.length && eval('var ' + scope.var + this.cond)
		? build(this.data, cache, scope)
		: this.else.length
			? build(this.else, cache, scope)
			: ''
}
// include
function ast_include (data) {
	this.type = 'include'
	this.data = data
}
ast_include.prototype.run = function (cache, scope) {
	debug('include:', this.data)
	var f = cache.get(this.data)
	return f
		? build(f.data, cache, scope)
		: '//ERROR: ' + this.data + ' not found\n'
}
// uglify
function ast_uglify (data, options) {
	this.type = 'uglify'
	this.data = data
	this.options = options || {}
}
ast_uglify.prototype.run = function (cache, scope) {
	debug('uglify:', this.data)
	var f = cache.get(this.data)
	return f
		? uglify( build(f.data, cache, scope), this.options)
		: '//ERROR: ' + this.data + ' not found\n'
}
function uglify (code, config) {
	var ast = jsp.parse( code )
	ast = pro.ast_mangle(ast, config.mangle)
	ast = pro.ast_squeeze(ast, config.squeeze)
	return pro.gen_code(ast, config.gen)
}
