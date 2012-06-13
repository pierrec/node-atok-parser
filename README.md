# Parser builder

## Synopsis

Writing parsers is quite a common but sometimes lengthy task. To ease this process atok-parser leverages the [atok](https://github.com/pierrec/node-atok) tokenizer and performs the basic steps to set up a streaming parser, such as:

* Automatically instantiate a tokenizer with provided options
* Provide a mechanism to locate an error in the input data
	* `track([Boolean])`: keep track of the line and column positions to be used when building errors. Note that when set, tracking incurs a performance penalty.
* Proxy basic [node.js](http://nodejs.org) streaming methods: `write()`, `end()`, `pause()` and `resume()`
* Proxy basic [node.js](http://nodejs.org) streaming events (note that [data] and [end] are __not__ automatically proxied) and some of atok
	* [drain]
	* [debug]
* Provide preset variables within the parser constructor
	* atok (atok tokenizer instance)
	* self (this)
* Provide helpers that simplify parsing rules (see below for description)
	* `whitespace()`
	* `number()`
	* `float()`
	* `word()`
	* `string()`
	* `utf8()`
	* `chunk()`
	* `stringList()`
	* `match()`
	* `noop()`
	* `wait()`


## Download

It is published on node package manager (npm). To install, do:

    npm install atok-parser


## Usage

A silly example to illustrate the various pre defined variables and parser definition.

``` javascript
function myParser (options) {
	function handler (num) {
		// The options are set from the myParser function parameters
		// self is already set to the Parser instance
		if ( options.check && !isFinite(num) )
			return self.emit('error', new Error('Invalid float: ' + num))

		self.emit('data', num)
	}
	// the float() and whitespace() helpers are provided by atok-parser
	atok.float(handler)
	atok.whitespace()
}

var Parser = require('..').createParser(myParser)

// Add the #parse() method to the Parser
Parser.prototype.parse = function (data) {
	var res

	// One (silly) way to make parse() look synchronous...
	this.once('data', function (data) {
		res = data
	})
	this.write(data)

	// ...write() is synchronous
	return res
}

// Instantiate a parser
var p = new Parser({ check: true })

// Parse a valid float
var validfloat = p.parse('123.456 ')
console.log('parsed data is of type', typeof validfloat, 'value', validfloat)

// The following data will produce an invalid float and an error
p.on('error', console.error)
var invalidfloat = p.parse('123.456e1234 ')
```


## Methods

* `createParserFromFile(file[, parserOptions, parserEvents, atokOptions])`: return a parser class (Function) based on the input file.
	* __file__ (_String_): file to read the parser from(.js extension is optional)
	* __parserOptions__ (_String_): list of the parser named events with their arguments count
	* __parserEvents__ (_Object_): events emitted by the parser with
	* __atokOptions__ (_Object_): tokenizer options

The following variables are made available to the parser javascript code:
	* `atok (_Object_)`: atok tokenizer instanciated with provided options. Also set as this.atok *DO NOT DELETE*
	* `self (_Object_)`: reference to _this_
 Predefined methods:
	* `write(data)`
	* `end([data])`
	* `pause()`
	* `resume()`
	* `debug([logger (_Function_)])`
	* `track(flag (_Boolean_))`
 Events automatically forwarded from tokenizer to parser:
	* `drain`
	* `debug`

* `createParser(data[, parserOptions, parserEvents, atokOptions])`: same as `createParserFromFile()` but with supplied content instead of a file name
	* __data__ (_String_ | _Array_ | _Function_): the content to be used, can also be an array of strings or a function. If a function, its parameters are used as parser options unless parserOptions is set


## Helpers

Helpers are a set of standard Atok rules organized to match a specific type of data. If the data is encountered, the handler is fired with the results. If not, the rule is ignored. The behaviour of a single helper is the same as a single Atok rule:

* go to the next rule if no match, unless `continue(jump, jumpOnFail)` was applied to the helper
* go back to the first rule of the rule set upon match, unless `continue(jump)` was applied to the helper
* next rule set can be set using `next(ruleSetId)`
* rules can be jumped around by using `continue(jump, jumpOnFail)`. A helper has exactly the size of a single rule, which greatly helps defining complex rules.

``` javascript
// Parse a whitespace separated list of floats
var myParser = [
	'atok.float(function (n) { self.emit("data", n) })'
,	'atok.continue(-1, -2)'
,	'atok.whitespace()'
]

var Parser = require('atok-parser').createParser(myParser)
var p = new Parser

p.on('data', function (num) {
	console.log(typeof num, num)
})
p.end('0.133  0.255')
```

Arguments are not required. If no handler is specified, the [data] event will be emitted with the corresponding data.

* `whitespace(handler)`: ignore consecutive spaces, tabs, line breaks.
	* `handler(whitespace)`
* `number(handler)`: process positive integers
	* `handler(num)`
* `float(handler)`: process float numbers. NB. the result can be an invalid float (NaN or Infinity).
	* `handler(floatNumber)`
* `word(handler)`: process a word containing letters, digits and underscores
	* `handler(word)`
* `string([start, end, esc,] handler)`: process a delimited string. If end is not supplied, it is set to start.
	* _start_ (_String_): starting pattern (default=")
	* _end_ (_String_): ending pattern (default=")
	* _esc_ (_String_): escape character (default=\)
	* `handler(string)`
* `utf8([start, end,] handler)`: process a delimited string containing UTF-8 encoded characters. If end is not supplied, it is set to start.
	* _start_ (_String_): starting pattern (default=")
	* _end_ (_String_): ending pattern (default=")
	* `handler(UTF-8String)`
* `chunk(charSet, handler)`: 
	* _charSet_ (_Object_): object defining the charsets to be used as matching characters e.g. { start: 'aA', end 'zZ' } matches all letters
	* `handler(chunk)`
* `stringList([start, end, separator,] handler)`: process a delimited list of strings
	* _start_ (_String_): starting pattern (default=()
	* _end_ (_String_): ending pattern (default=))
	* _separator_ (_String_): separator character (default=,)
	* `handler(listOfStrings)`
* `match(start, end, stringQuotes, handler)`: find a matching pattern (e.g. bracket matching), skipping string content if required
	* _start_ (_String_): starting pattern to look for
	* _end_ (_String_): ending pattern to look for
	* _stringQuotes_ (_Array_): array of string delimiters (default=['"', "'"]). Use an empty array to disable string content processing
	* `handler(token)`
* `noop()`: passthrough - does not do anything except applying given properties (useful to branch rules without having to use `atok#saveRuleSet()` and `atok#loadRuleSet()`)
* `wait(atokPattern[...atokPattern], handler)`: wait for the given pattern. Nothing happens until data is received that triggers the pattern. Must be preceded by `continue()` to properly work. Typical usage is when expecting a string the starting quote is received but not the end... so wait until then and resume the rules workflow.
* `nvp([nameCharSet, separator, endPattern] handler)`: parse a named value pair (default nameCharSet={ start: 'aA0_', end: 'zZ9_' }, separator==, endPattern={ firstOf: ' \t\n\r' }).
	* `handler(name, value)`


## Examples

A set of examples are located under the examples/ directory.