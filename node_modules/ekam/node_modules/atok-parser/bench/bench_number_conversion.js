/**
 compare Number() vs string coercion performance
**/
var numString = '123.456'
var invalidNumString = '123.a456'

exports.compare = {
	"Number()" : function () {
		var n = Number(numString)
	}
, "string coercion" : function () {
		var n = +numString
	}
, "invalid Number()" : function () {
		var n = Number(invalidNumString)
	}
, "invalid string coercion" : function () {
		var n = +invalidNumString
	}
}
require("bench").runMain()
