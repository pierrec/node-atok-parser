# Package builder

## Synopsis

Ekam is yet another build tool for node, designed to handle file includes, regardless of the file format, although it is primarily aimed at building javascript, html and css files. It comes as a single command line utility.

As of the current version, only JavaScript is supported, although html and css are planned and easy to add, as well as other formats.


## Download

It is published on node package manager (npm). To install, do:

    npm install ekam -g


## Usage

    ekam --help

    Usage: ekam [options]

      Options:

        -h, --help                     output usage information
        -V, --version                  output the version number
        -b, --build <js or json file>  Use the specified build file
        -i, --init                     Creates a default sample build file



Ekam takes either a json file or a JavaScript file containing information about what it has to do.

	ekam --build src/build.json
or

	ekam --build src/build.js


Sample build.json and build.js files can be produced with the option `init`

	ekam --init

* build.json

``` javascript
{
	"input": {
		"include": "**/*.js"
	, "exclude": "build.json build.js"
	}
,	"output": {
		"path": "../build"
	, "mode": "0755"
	, "clean": true
	}
,	"uglify": {
		"mangle": {
			"defines": {
				"DEBUG": [ "name", "false" ]
			}
		}
	,	"squeeze": {
			"make_seqs": true
		,	"dead_code": true
		}
	,	"gen": {
		}
	}
}
```

* build.js

``` javascript
build(
	{
		"input": {
			"include": "**/*.js"
		, "exclude": "build.json build.js"
		}
	,	"output": {
			"path": "../build"
		, "mode": "0755"
		, "clean": true
		}
	,	"uglify": {
			"mangle": {
				"defines": {
					"DEBUG": [ "name", "false" ]
				}
			}
		,	"squeeze": {
				"make_seqs": true
			,	"dead_code": true
			}
		,	"gen": {
			}
		}
	}
)
```


The following properties are required:

* `input`
	* `include` (_String_): list of expressions or files to be processed
	* `exclude` (_String_): list of expressions or files to be excluded
* `output`: the properties are the same as the ones defined in the [fstream](https://github.com/isaacs/fstream) module
	* `path` (_String_): path to the generated files

The following properties are optional:

* `uglify`: contains the options object passed to the `uglify()` method

To run the tool with DEBUG information, set the DEBUG environment variable to a list of comma separated values:

	DEBUG=ekam,build,include,file,js-parser,js-ast ekam --build src/build.json

* ekam
* build
* include
* file
* js-ast


## Example

Let's say we have to build a single javascript file split up in two files as well as its minified and debug versions. The example is provided in the examples/example1 directory.

__Important__ only files with no parent dependency get built in the output directory.

The input files are defined under the src/ directory:

* src/file1.js
* src/file2.js

The output files are to be defined as (yes they are defined in the input directory!):

* src/file.js

``` javascript
//include("file1.js", "file2.js")
```

* src/file.debug.js

``` javascript
//var DEBUG=true
//include("file1.js", "file2.js")
```

The files file1.js and file2.js should contain a line like the following one to include some debug traces:

``` javascript
//if(DEBUG)
console.log('DEBUG', ...)
//endif
```

* src/file.min.js

``` javascript
//uglify("_file.js")
```

* src/_file.js

This is a temporary file that collects the content for the minified version.

``` javascript
//include("file1.js", "file2.js")
```

When the `ekam` command is run, it creates the following files (note that the www/ directory is automatically created if it does not exist already):

* www/file.js - concatenation of file1.js and file2.js
* www/file.debug.js - same as file.js but with debug commands
* www/file.min.js - minified version of file.js
