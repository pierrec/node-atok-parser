// Letters, digits and underscore
// 65-90 97-122, 48-57, 95
/**
 * All arguments are optional
 * delimiters (Array): list of characters delimiting the word
 * handler (String | Function): rule handler
 *
 * *important* word() will always continue(0) at the end to avoid infinite loops
**/
module.exports.word = function (/* delimiters, handler */) {
	var args = this._helper_setArguments([null], arguments, 'word')

	return this
		.saveProps('word')
		._helper_word(args[0], args[1], { start: 'aA0_', end: 'zZ9_' })
		.loadProps('word')
}
