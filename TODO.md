# TODO

* tracker: #end -> #stop
* rewrite the tracker
* float(): test cases for invalid floats and used with continue(x, y) y !== null
* change handlers signature to err, data

## Issues

* float() in single rule mode is _slow_ (about 15% slower)

## Features

* Helpers

## Bugs

* all helpers: last arg must be a function (should also support number and string)
* tracker() not displaying proper cursor in some instances
  -> due to bytesRead + seek(-xx) ??
* escaped(), break() not supported on helpers
* continue() cannot be used with non numeric values on helpers
* wait() helper does not work properly with trimLeft(), trimRight()

* ('-' '-.').float(): should consider it a failed rule
* helpers with a boolean argument should discard it or not be applied (true/false) like addRule() as of atok@0.2.5