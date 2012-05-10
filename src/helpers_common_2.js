			, -1
			, null
			)

		atok.offsetBuffer = -1
	}
	function _helper_end () {
		_helper_done(0)
	}

	atok
		.once('end', _helper_end)

		.saveProps(helperId)
		.trimLeft().next(_ruleSet).ignore().quiet(true)

			// Match / no match
			.addRule(firstMatch, _helper_start)
		
		.saveRuleSet(helperId)

		.clearRule()
