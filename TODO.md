# TODO

## Issues

* float() in single rule mode is _slow_ (about 15% slower)

## Features

* Helpers

## Bugs

* all helpers: last arg must be a function (should also support number and string)
* match(start, end): start and end length must be 1 or it fails on chunked data
  -> will be fixed by atok (always enforce first subrule)
* tracker() not displaying proper cursor in some instances
  -> due to bytesRead + seek(-xx) ??
* escaped(), break() not supported on helpers
* continue() cannot be used with non numeric values on helpers

* match_length is wrong if used with stringQuotes[].length !== 2 -> adjust accordingly
-> make helpers behave like a single rule: issue: need to use loadRuleSet() which loses the current rule set index required if continue() is used
* wait() only really working with 2 subrules, if subrules > 2, need to addRule() for all intermediate cases
	i.e. wait(sr1, sr2, sr3) ->
		addRule(sr1, sr2, sr3)
		addRule(sr1, sr2)
		addRule(sr1)
* ('-' '-.').float(): should consider it a failed rule
* helpers with a boolean argument should discard it or not be applied (true/false) like addRule() as of atok@0.2.5
* rewrite default_behaviour test for continue(-1)