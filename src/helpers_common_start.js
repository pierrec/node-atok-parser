// required vars: firstMatch, helperId, handler
// sets: firstMatchLen
// sets: startOffset
	var atok = this

	var firstMatchLen = 0
	var props = atok.getProps('quiet', 'ignore', 'continue', 'trimLeft', 'trimRight')
	var isQuiet = props.quiet
	var isIgnored = props.ignore
	var hasContinue = props.continue[0]

	if (hasContinue !== null && typeof hasContinue !== 'number')
		throw new Error('continue value must be a number: ' + hasContinue)

	var ruleSet			// rule set the helper is called from
		, ruleIndex		// index of the rule calling the helper
	// Current helper rule set id
	var _ruleSet = helperId + '#' + (_helper_ruleset_id++)
	var startOffset 				// Starting offset
	var resetOffsetBuffer = false	// First helper to set the offsetBuffer value?
	var running = false				// Current helper running

	function _helper_start (matched) {
		running = true
		firstMatchLen = matched
		startOffset = atok.offset - matched
		// Prevent buffer slicing by atok
		resetOffsetBuffer = (atok.offsetBuffer < 0)
		if (resetOffsetBuffer) atok.offsetBuffer = startOffset

		// Upon successful completion...
		// Set the rule index to jump to 
		ruleIndex = atok.ruleIndex + hasContinue + 1
		// Set the rule set to load
		ruleSet = atok.currentRule
		if (!ruleSet) {
			// Helper was called from an unsaved rule set
			ruleSet = _ruleSet + '#unsaved'
			atok.saveRuleSet(ruleSet)
		}
	}
	function _helper_done (matched) {
		running = false
		// Resume where it should
		atok.loadRuleSet(ruleSet, ruleIndex)
		// We have some matching which should be reverted
		atok.seek(-matched)

		// Comply to the tokenizer properties
		if (!isIgnored)
			handler(
				isQuiet
					? atok.offset - startOffset
					://if(res) //eval(res)//else atok._slice(startOffset, atok.offset)//endif
			, -1
			, null
			)

		if (resetOffsetBuffer) atok.offsetBuffer = -1
	}
	function _helper_doneCancel (matched) {
		running = false
		// Resume at the next rule, as if the first match failed
		atok.loadRuleSet(ruleSet, ruleIndex)
		// We have some matching which should be reverted
		atok.seek(-matched)

		if (resetOffsetBuffer) atok.offsetBuffer = -1
	}
	function _helper_end () {
		// Only trigger the running helper on the [end] event
		if (running) _helper_done(0)
	}

	atok
		.saveProps(helperId)
		.trimLeft().next(_ruleSet).ignore().quiet(true)

			// Rule that will switch to the helper rule set upon match
			.addRule(firstMatch, _helper_start)
		
		// Temporarily save the rule set
		.saveRuleSet(helperId)

		.clearRule()
