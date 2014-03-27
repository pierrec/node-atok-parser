0.4.4 / 2014-03-27
==================

* Fix: float():
	* dont move offset on invalid float
	* Infinity is a valid float value
	* quiet(true).float() does not skip invalid float

0.4.3 / 2013-03-13
==================

* Updated to support eval 0.1

0.4.2 / 2012-12-04
==================

* Constructor no longer set to Parser if `createParser` or `createParserFromFile` is supplied a function but the function name
* Fix: `utf8()` helper supports custom arguments, continue() jumps properly

0.4.1 / 2012-11-21
==================

* Added block_stream example
* utf8 helper rewrite: performance improvements

0.4.0 / 2012-11-07
==================

* Support for Atok 0.4.x

0.3.2 / 2012-07-17
==================

* `wait()` fixes

0.3.1 / 2012-07-16
==================

* The [end] event is no longer automatically forwarded

0.3.0 / 2012-06-22
==================

* Helpers:
	* Internal refactoring: removed `loadRuleSet()` usage, leveraging Atok#groupRule()
	* `string()`
		* waits for the end of the string if first match is found
		* accepts a custom escape character: `string(start, end, esc, handler)`
	* `number()` and `float()` ignore invalid numbers (NaN, -Infinity, Infinity) if used with `quiet()`
	* `whitespace` now processes multiple white spaces by default (override with continue()) and can accept a list of them
	* `wait()`
		* now accepts '' and a number as first pattern
		* stops the processing if not enough data to validate the first pattern
	* `stringList()` calls its handler with an error on any parse error
	* New helper `nvp(nameCharSet, separator, endingPattern, handler)`: provide an object representing a named value pair ({ name: <name>, value: <value> }) to its handler
* Tracker
	* `track()` now only accepts boolean
* Added `debug()` accepts a function as a listener for the [debug] event. Only the first listener is registered.
* Event [end] is now forwarded from the tokenizer
* New variable available in the Parser main body: atokTracker
* Internal changes:
	* Renamed `Tracker#end` to `Tracker#stop`
	* Tracker rewrite

0.2.0 / 2012-05-24
==================

* Added `debug()`
* Removed: delimiters support for `float()`, `number()` and `word()`
* Changed (for convenience as Parser are more likely to be created from content):
	* `createParserFromContent()` renamed `createParser()`
	* `createParser()` renamed `createParserFromFile()`
* `createParser()` accepts a function as content and uses the function parameters
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