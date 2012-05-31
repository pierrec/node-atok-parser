	atok
		.quiet(true).ignore()
			.addRule(_helper_done)
// include("helpers_common_end.js")
	return atok
		// Save the helper rule set
		.saveRuleSet(_ruleSet)

		// Restore the current rules and properties
		.loadRuleSet(helperId)
		.deleteRuleSet(helperId)
		.loadProps(helperId)
