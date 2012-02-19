# Parser builder

## Synopsis

Writing parsers is quite a common but sometimes lengthy task. To ease this process atok-parser leverages the atok tokenizer and performs the basic steps to set up a streaming parser, such as:

* Automatically instantiate a tokenizer
* Provide a mechanism to locate an error in the input data
	* `track([Boolean])`: keep track of the line and column positions to be used when building errors
* Proxy basic streaming methods
	* `write()`
	* `end()`
	* `pause()`
	* `resume()`
* Proxy basic streaming events (note that [data] and [end] are __not__ automatically proxied)
	* [drain]
* Provide preset variables
	* atok (tokenizer)
	* self (this)
* Provide helpers that simplify parsing rules
	* whitespace
	* number
	* float
	* word
	* string
	* utf8
	* chunk
	* stringList

## Download

It is published on node package manager (npm). To install, do:

    npm install atok-parser

## Usage

``` javascript
var atokParser = require('atok-parser')
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

## Helpers

Arguments are not required.

* `whitespace(handler)`: process spaces, tabs, line breaks. Ignored by default, unless a handler is specified
* `number(delimiters, handler)`: process positive integers. 
	* delimiters: array of characters ending the number
	* `handler(num)`
* `float(delimiters, handler)`: process float numbers.
	* delimiters: array of characters ending the float number
	* `handler(floatNumber)`
* `word(delimiters, handler)`: process a word containing letters, digits and underscore. 
	* delimiters: array of characters ending the float number
	* `handler(word)`
* `string(start, end, handler)`: process a delimited string.
	* start: starting character
	* end: ending character
	* `handler(string)`
* `utf8()`: process a delimited string containing UTF-8 encoded characters
	* start: starting character
	* end: ending character
	* `handler(UTF-8String)`
* `chunk()`: 
	* charSet: object defining the charsets to be used as matching characters e.g. { start: 'aA', end 'zZ' } matches all letters
	* `handler(chunk)`
* `stringList()`: process a delimited list of strings
	* start: starting character
	* end: ending character
	* separator: separator character
	* `handler(listOfStrings)`

## Examples

Coming soon.