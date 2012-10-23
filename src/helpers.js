/*
	Best practices:
	- name the handlers according to the helper name (useful in debug mode)
 */
var isArray = require('util').isArray
var Atok = require('atok')
var sliceArguments = require('fnutils').slice

// if a handler is to be defined it *must* be a function
module.exports._helper_setArguments = function (defaults, args, type) {
	var atok = this, n = args.length

	// Ignore the rule
	if (n > 0 && args[n-1] === false) return false

	// Set the handler
	if (n === 0 || typeof args[n-1] !== 'function') {
		if (n > 0) type = args[--n]

		defaults.push(
			atok.handler || function helperDefaultHandler (token) {
				atok.emit_data(token, arguments.length > 1 ? arguments[1] : -1, type)
			}
		)
	} else {
		defaults.push( args[--n] )
	}

	var i = -1
	while (++i < n) {
		if (typeof args[i] !== 'undefined') defaults[i] = args[i]
	}

	return defaults
}

module.exports._helper_continueFailure = function (props, jumpPos, jumpNeg) {
	var cont = props.continue[1]
	return cont + (cont < 0 ? jumpNeg : jumpPos)
}
module.exports._helper_continueSuccess = function (props, jumpPos, jumpNeg) {
	var cont = props.continue[0]
	return cont === null ? null : cont + (cont < 0 ? jumpNeg : jumpPos)
}

var markedOffsetList = []
var offsetList = []
module.exports._mark = function () {
	markedOffsetList.push( this.markedOffset )
	offsetList.push(this.offset)

	return this.markedOffset = this.offset
}
module.exports._unmark = function () {
	this.markedOffset = markedOffsetList.pop()

	return offsetList.pop()
}

module.exports._helper_word = function (wordStart, handler) {
	var atok = this
	var resetMarkedOffset = false	// First helper to set the markedOffset value?
	var running = false				// Current helper running

	var props = atok.getProps()
	var isQuiet = props.quiet
	var isIgnored = props.ignore

	function _helper_start () {
		running = true
		// Prevent buffer slicing by atok
		atok._mark()
	}
	function _helper_done () {
		running = false
		var offset = atok._unmark()
		if (!isIgnored) {
			handler(
				isQuiet
					? atok.offset - offset
					: atok.slice(offset, atok.offset)
			, -1
			, null
			)
		}
	}
	function _helper_end () {
		if (running) _helper_done()
	}

	return atok
		.once('end', _helper_end)

		.groupRule(true)
		// Match / no match
		.ignore()			// The handler needs to fire
		.quiet(true)	// Data doesnt matter
		.next()				// Dont change ruleSet
		.break()			// Dont exit the loop
		.continue( 0, this._helper_continueFailure(props, 2, 0) )
			.addRule(wordStart, _helper_start)

		// while(character matches a word letter)
		.continue(-1).ignore(true)
			.addRule(wordStart, '_helper_wordCheck')

		// Word parsed, reset the properties except ignore and quiet
		.setProps(props).ignore().quiet(true)
		.continue( this._helper_continueSuccess(props, 0, 2) )
		.addRule(_helper_done)

		.setProps(props)
		.groupRule()
}

//include("helpers/*.js")
