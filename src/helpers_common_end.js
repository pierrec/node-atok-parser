	return atok
		// Save the helper rule set
		.saveRuleSet(_ruleSet)

		// Restore the current rules and properties
		.loadRuleSet(helperId)
		.deleteRuleSet(helperId)
		.loadProps(helperId)
