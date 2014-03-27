var charList = ['"', '\\', 'n', 'r', 't', 'b', 'f']
var valueList = ['"', '\\', '\n', '\r', '\t', '\b', '\f']
var valueListBuffer = valueList.map(function (v) { return new Buffer(v) })

module.exports.utf8 = function (/* start, end, esc, handler */) {
  var args = this._helper_setArguments(['"', '"', '\\'], arguments, 'utf8')

  if (!args) return this

  var handler = args.pop()

  // Special case: if end is not set, use the start value
  if (arguments.length === 0 || !arguments[1])
    args[1] = args[0]

  function utf8Done (data) {
    if (isQuiet) return handler(utf8Current)

    if (data.length > 0) utf8Current.push( isBuffer ? new Buffer(data) : data )
    handler(
      typeof data === 'string'
        ? utf8Current.join('')
        : Buffer.concat(utf8Current)
    )
    utf8Current = null
  }

  var atok = this
  var props = this.getProps()

  var isQuiet = props.quiet
  var isBuffer = false

  var utf8Current = null
  var escaped = false
  var escapeOffset = -1

  var leftLength = args[0].length
  var rightLength = args[1].length
  var escLength = args[2].length

  function isEscaped (data, offset) {
    if (!escaped) return -1

    utf8Current = isQuiet
      ? escapeOffset - offset - leftLength
      : escapeOffset > offset + leftLength
          ? [ data.slice(offset + leftLength, escapeOffset) ]
          : []

    return escapeOffset - offset + leftLength
  }

  // Make the rule fail if an escape char was found
  function hasEscapeFirst (data, offset) {
    isBuffer = (!isQuiet && typeof data !== 'string')
    escaped = (this.prev.idx > 0)

    return escaped
      ? ( escapeOffset = offset - escLength, -1 )
      //HACK to bypass the trimLeft/trimRight properties
      : ( this.prev.prev.length = leftLength + 1, atok.offset--, 1 )
  }

  function hasEscape (data, offset) {
    escaped = (this.prev.idx > 0)

    // End of string found
    if (!escaped) {
      this.prev.prev.length = 1
      atok.offset--
      return 1
    }

    // Is there anything to extract?
    // Rule will fail but we still skip the escape char
    if ( escapeOffset + escLength + 1 < offset - escLength ) {
      if (isQuiet) {
        utf8Current += offset - escapeOffset - 2 * escLength - 1
      } else {
          data = data.slice(escapeOffset + escLength + 1, offset - escLength)
          utf8Current.push( isBuffer ? new Buffer(data) : data )
      }

      // Make sure the escapeOffset is moved accordingly
      atok.offset += offset - escapeOffset - 2 * escLength
    } else {
      atok.offset++
    }

    escapeOffset = offset - escLength

    return -1
  }

  return atok
    .groupRule(true)
      .continue(
          this._helper_continueSuccess(props, 5, 0)
        , 0
        )
      .addRule(args[0], { firstOf: args.slice(1) }, hasEscapeFirst, handler)
      // Rule failed:
      // - escape found
      // - not a string
      // - incomplete string
      .ignore().quiet().break().next().trim(true)
      .ignore(true).continue(2)
        // Escape found
        .addRule(isEscaped, 'utf8-checkEscaped')
      .break(true)
        .continue( -3, this._helper_continueFailure(props, 3, -3) )
          .addRule(args[0], 'utf8-checkString')
      .break().continue()
      .ignore()
      // Process escaped char
      .setProps(props)
      .continue(
          this._helper_continueSuccess(props, 2, 0)
        , 0
        )
      .trim(true).quiet()
        .addRule('', { firstOf: args.slice(1) }, hasEscape, utf8Done)
      .ignore().break().next()
        .quiet(true).continue(-2)
          .addRule(charList, function utf8CharPush (data, idx) {
            if (isQuiet) return utf8Current++

            utf8Current.push( isBuffer ? valueListBuffer[idx] :valueList[idx] )
          })
        .quiet().continue(-3).trimRight()
        .addRule('u', 4, function utf8Push (data) {
          if (isQuiet) return utf8Current += 2

          // The escapeOffset is 4 bytes longer
          escapeOffset += 4
          var u = parseInt(data, 16)
          if ( isFinite(u) ) {
            data = String.fromCharCode(u)
            utf8Current.push( isBuffer ? new Buffer(data) : data )
          } else {
            utf8Atok.emit_error( new Error('Invalid unicode: ' + data) )
          }
        })
        .continue().trimRight(true)

    .setProps(props)
    .groupRule()
}
