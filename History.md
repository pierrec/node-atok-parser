0.2.0 / 2012-05-07
==================

	* Removed: delimiters support for `float()`, `number()` and `word()`
	* Changed (for convenience as Parser are more likely to be created from content):
		* `createParserFromContent()` renamed `createParser()`
		* `createParser()` renamed `createParserFromFile()`
	* `createParser()` accepts a function as content and uses the functino parameters
	* Performance improvements on most helpers via `acc()` functions removal and use of `continue(success, failure)`
	* Examples refactoring

0.1.3 / 2012-03-22
==================

	* New properties giving helpers number of rules: `<helper>_length`
	* `float()` fix
	* Added the `wait()` helper

0.1.2 / 2012-03-16
==================

	* Use the `eval` module to create the Parser constructor
	* Helper `utf8()` behaves like the `string()` one
	* Fixed typo where debug event would not be forwarded properly
	* Helper `stringList()` behaves properly with malformed lists

0.1.1 / 2012-02-29
==================

	* Helpers refactoring
	* Default behaviour applied to all helpers
	* New helpers
		* `noop()`
		* `match(start, end, stringQuotes[], handler)`
	* New method
		* `createParserFromContent(data, parserOptions, parserEvents, atokOptions)`
	* Added `version` property
	* Fix [drain] and [debug] events not being properly propagated

0.1.0 / 2012-02-26
==================

	* Moved from node's EventEmitter to [ev](https://github.com/pierrec/node-ev)
	* `createParser(file, parserOptions, atokOptions)` => `createParser(file, parserOptions, parserEvents, atokOptions)`
	* Tracker now wraps Atok Rules test method instead of relying on the no longer existing [match] event

0.0.5 / 2012-02-23
==================

	* `chunk()` fix
	* [debug] tokenizer event automatically emitted by the parsers

0.0.4 / 2012-02-19
==================

	* `stringList()` helper added
	* [drain] tokenizer event automatically emitted by the parsers

0.0.3 / 2012-02-16
==================

	* `word()` and `number()` helpers rewrite
	* `float()` helper added
	* `string()` helper added
	* `chunk()` helper added
	* `utf8()` helper added

0.0.2 / 2012-02-09
==================

	* Added helpers
		* `whitespace()`
		* `word()`
		* `number()`