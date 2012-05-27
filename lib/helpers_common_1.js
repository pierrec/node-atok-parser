	var atok = this

	var props = atok.getProps('quiet', 'ignore', 'continue')
	var isQuiet = props.quiet
	var isIgnored = props.ignore
	var hasContinue = props.continue[0]

	if (hasContinue !== null && typeof hasContinue !== 'number')
		throw new Error('continue value must be a number: ' + hasContinue)

	var ruleSet			// rule set the helper is called from
		, ruleIndex		// index of the rule calling the helper
	// Current helper rule set id
	var _ruleSet = helperId + '#' + (_helper_ruleset_id++)

	function _helper_start (matched) {
		atok.offsetBuffer = atok.offset - matched

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
		// Resume where it should
		atok.loadRuleSet(ruleSet, ruleIndex)
		// We have some matching which should be ignored
		atok.seek(-matched)
		
		if (!isIgnored)
			handler(
				isQuiet
					? atok.offset - atok.offsetBuffer
