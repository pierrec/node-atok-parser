# TODO

* all helpers: last arg === false -> ignore the helper
* all helpers: last arg must be a function (should also support number and string)
-> enforce last arg as the handler/type on helpers (to be consistent with Atok#addRule())
* rework somewhat _helper_setArguments to not generate an anonymous function

## Issues

* float() in single rule mode is _slow_ (about 15% slower)

## Features

* Helpers

## Bugs

* tracker() not displaying proper cursor in some instances
  -> due to bytesRead + seek(-xx) ??
* escaped(), break() not supported on helpers
* continue() cannot be used with non numeric values on helpers
* wait() helper does not work properly with trimLeft(), trimRight()

* ('-' '-.').float(): should consider it a failed rule
* helpers with a boolean argument should discard it or not be applied (true/false) like addRule() as of atok@0.2.5