/*
	Best practices:
	- name the handlers according to the helper name (useful in debug mode)
 */
var isArray = require('util').isArray
var Atok = require('atok')

// if a handler is to be defined it *must* be a function
module.exports._helper_setArguments = function (defaults, args, type) {
	var atok = this, n = args.length
	var res = defaults

	// Set the handler
	var handler = n > 0 && typeof args[n-1] === 'function'
		? args[--n]
		: (atok.handler || function helperDefaultHandler (token) {
						atok.emit_data(token, arguments.length > 1 ? arguments[1] : -1, type)
					})
	
	var i = 0
	while (i < n) {
		if (args[i]) res[i] = args[i]
		i++
	}

	return res.concat(handler)
}

module.exports._helper_continueFailure = function (props, jumpPos, jumpNeg) {
	var cont = props.continue[1]
	return cont + (cont < 0 ? jumpNeg : jumpPos)
}
module.exports._helper_continueSuccess = function (props, jumpPos, jumpNeg) {
	var cont = props.continue[0]
	return cont === null ? null : cont + (cont < 0 ? jumpNeg : jumpPos)
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
		resetMarkedOffset = (atok.markedOffset < 0)
		if (resetMarkedOffset) atok.markedOffset = atok.offset - 1
	}
	function _helper_done () {
		running = false
		if (!isIgnored)
			handler(
				isQuiet
					? atok.offset - atok.markedOffset
					: atok.slice(atok.markedOffset, atok.offset)
			, -1
			, null
			)

		if (resetMarkedOffset) atok.markedOffset = -1
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
		// Restore all properties
		.ignore(isIgnored).quiet(isQuiet)

		.groupRule()
}

//include("helpers/*.js")
