var utf8Atok = new Atok()

var utf8Current = ''
var charList = ['"', '\\', 'n', 'r', 't', '/', 'b', 'f']
var valueList = ['"', '\\', '\n', '\r', '\t', '\/', '\b', '\f']

utf8Atok
  .next('expectEscape')
  .quiet(true)
    .addRule(charList, function (data, idx) {
      utf8Current += valueList[idx]
    })
  .quiet()
  .addRule('u', 4, function (data) {
    for (var hex, u = 0, i = 0; i < 4; i++) {
      hex = parseInt(data[i], 16)
      if ( !isFinite(hex) ) {
        utf8Atok.emit_error( new Error('Invalid unicode: ' + data) )
        break
      }
      u = u * 16 + hex
    }
    utf8Current += String.fromCharCode(u)
  })
  .addRule(1, function (data) {
    utf8Atok.emit_error( new Error('Invalid escapee: ' + data) )
  })
  .saveRuleSet('expectEscapee')

  .clearRule()
  .next('expectEscapee')
  .addRule('', '\\', function (data) {
    utf8Current += data
  })
  .next('expectEscape')
  .addRule('', function (data) {
    if (utf8Current.length > 0)
      utf8Current += data
    else
      utf8Current = data
  })
  .saveRuleSet('expectEscape')

module.exports.utf8 = function (/* start, end, handler */) {
  var args = this._helper_setArguments(['"', '"'], arguments, 'utf8')
  var handler = args[2]

  // Special case: if end is not set, use the start value
  var last = arguments[arguments.length-1]
  if (arguments.length < 3 && (!last || typeof last === 'function'))
    args[1] = args[0]

  function utf8Handler (data) {
    // Either not enough data to have UTF8 data or `quiet(true)`
    if (data.length < 2 || typeof data === 'number') {
      handler(data)
    } else {
      utf8Atok.write(data)
      handler( utf8Current )
      utf8Current = ''
    }
  }

  return this.string(args[0], args[1], utf8Handler)
}
