# Parser builder

## Synopsis

Writing parsers is quite a common but sometimes lengthy task. To ease this process atok-parser leverages the [atok](https://github.com/pierrec/node-atok) tokenizer and performs the basic steps to set up a streaming parser, such as:

* Automatically instantiate a tokenizer with provided options
* Provide a mechanism to locate an error in the input data
	* `track([Boolean])`: keep track of the line and column positions to be used when building errors. Note that when set, tracking incurs a performance penalty.
* Proxy basic [node.js](http://nodejs.org) streaming methods
	* `write()`
	* `end()`
	* `pause()`
	* `resume()`
* Proxy basic [node.js](http://nodejs.org) streaming events (note that [data] and [end] are __not__ automatically proxied)
	* [drain]
	* [debug]
* Provide preset variables within the parser constructor
	* atok (atok tokenizer instance)
	* self (this)
* Provide helpers that simplify parsing rules
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


## Download

It is published on node package manager (npm). To install, do:

    npm install atok-parser


## Usage

``` javascript
var atokParser = require('atok-parser')
// myParser.js contains the rules and other relevant code
var Parser = atokParser.createParser('./myParser', 'options')

// Add the #parse() method to the Parser
Parser.prototype.parse = function (data) {
  var res

	this.sync = true
  this.write(data)
	res = this.current

	this.current = null
	this.sync = false

  return res
}

// Instantiate a parser
var p = new Parser({ option: false })
	.on('error', console.error)
	.on('data', console.log)

p.parse('some data')
```


## Methods

* `createParser(file[, parserOptions, parserEvents, atokOptions])`: return a parser class (Function) based on the input file.
	* __file__ (_String_): file to read the parser from(.js extension is optional)
	* __parserOptions__ (_String_): list of the parser named events with their arguments count
	* __parserEvents__ (_Object_): events emitted by the parser with
	* __atokOptions__ (_Object_): tokenizer options

The following variables are made available to the parser javascript code:
	* `atok (_Object_)`: atok tokenizer instanciated with provided options. Also set as this.atok *DO NOT DELETE*
	* `self (_Object_)`: reference to _this_
 Predefined methods:
	* `write()`
	* `end()`
	* `pause()`
	* `resume()`
	* `track()`
 Events automatically forwarded from tokenizer to parser:
	* `drain`
	* `debug`


## Helpers

Helpers are a set of standard Atok rules organized to match a specific type of data. If the data is encountered, the handler is fired with the results. The behaviour of a single helper is the same as a single Atok rule:

* go to the next rule if no match
* go back to the first rule of the rule set upon match, unless `continue(jump)` was applied to the helper
* next rule set can be set using `next(ruleSetId)`

Arguments are not required. If no handler is specified, the [data] will be emitted with the corresponding data.

* `whitespace(handler)`: process spaces, tabs, line breaks. Ignored by default, unless a handler is specified
	* `handler(whitespace)`
* `number(delimiters, handler)`: process positive integers. 
	* __delimiters__ (_Array_): array of characters ending the number
	* `handler(num)`
* `float(delimiters, handler)`: process float numbers.
	* __delimiters__ (_Array_): array of characters ending the float number
	* `handler(floatNumber)`
* `word(delimiters, handler)`: process a word containing letters, digits and underscore. 
	* __delimiters__ (_Array_): array of characters ending the float number
	* `handler(word)`
* `string(start, end, handler)`: process a delimited string.
	* _start_ (_String_): starting pattern
	* _end_ (_String_): ending pattern
	* `handler(string)`
* `utf8(start, end, handler)`: process a delimited string containing UTF-8 encoded characters
	* _start_ (_String_): starting pattern
	* _end_ (_String_): ending pattern
	* `handler(UTF-8String)`
* `chunk(charSet, handler)`: 
	* _charSet_ (_Object_): object defining the charsets to be used as matching characters e.g. { start: 'aA', end 'zZ' } matches all letters
	* `handler(chunk)`
* `stringList(start, end, separator, handler)`: process a delimited list of strings
	* _start_ (_String_): starting pattern
	* _end_ (_String_): ending pattern
	* _separator_ (_String_): separator character
	* `handler(listOfStrings)`
* `match(start, end, stringQuotes[], handler)`: find a matching pattern (e.g. bracket matching), skipping string content if required
	* _start_ (_String_): starting pattern to look for
	* _end_ (_String_): ending pattern to look for
	* _stringQuotes_ (_Array_): array of string delimiters (default=['"', "'"]). Use an empty array to disable string content processing
	* `handler(token)`
* `noop()`: passthrough - does not do anything except applying given properties (useful to branch rules without having to use `atok#saveRuleSet()` and `atok#loadRuleSet()`)


## Examples

Coming soon.