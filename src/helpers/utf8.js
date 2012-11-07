var utf8Atok = new Atok()

var utf8Current = []
var charList = ['"', '\\', 'n', 'r', 't', '/', 'b', 'f']
var valueList = ['"', '\\', '\n', '\r', '\t', '\/', '\b', '\f']

utf8Atok
  .continue(0, 3)
  .addRule('', '\\', function (data) {
    utf8Current.push(data)
  })
  .quiet(true).continue(-2)
    .addRule(charList, function (data, idx) {
      utf8Current.push(valueList[idx])
    })
  .quiet().trimRight().continue(-3)
  .addRule('u', 4, function (data) {
    var u = parseInt(data, 16)
    if ( isFinite(u) )
      utf8Current.push(String.fromCharCode(u))
    else
      utf8Atok.emit_error( new Error('Invalid unicode: ' + data) )
  })
  .continue()
  .addRule(function (data) {
    utf8Atok.emit_error( new Error('Invalid escapee: ' + data) )
  })
  .addRule('', function (data) {
      utf8Current.push(data)
  })

module.exports.utf8 = function (/* start, end, esc, handler */) {
  var args = this._helper_setArguments([], arguments, 'utf8')

  if (!args) return this

  var handler = args.pop()

  function utf8Handler (data) {
    // Either not enough data to have UTF8 data or `quiet(true)`
    if (data.length < 2) {
      handler(data)
    } else {
      utf8Atok.write(data)
      handler(
        typeof data === 'string'
          ? utf8Current.join('')
          : Buffer.concat(utf8Current)
      )
      utf8Current = []
    }
  }

  var props = this.getProps()

  // Nothing to do if quiet()
  args.push( props.quiet ? handler : utf8Handler )

  return this.string.apply(this, args)
}
