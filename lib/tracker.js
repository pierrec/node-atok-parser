var Atok = require('atok')

// Wrap a method with a given function
// Function gets the set of arguments and result of the wrapped method
function wrapMethod (self, method, fn) {
  if (arguments.length < 3) {
    // Unwrap
    self[method] = self[method].prevMethod || self[method]
    return
  }

  // Wrap
  var prevMethod = self[method]
  self[method] = function () {
    var res = prevMethod.apply(self, arguments)
    fn(arguments, res)
    return res
  }
  // Save the previous method
  self[method].prevMethod = prevMethod
}

function Tracker (atok) {
  var self = this

  this.atok = atok
  this.running = false

  this.clear()

  // Count the number of newlines in the last match
  this.check = function (offset, matched) {
    self.x = self.xx
    self.y += self.yy

    var prevY = self.yy

    self.yy = 0
    self.atokNL
      .clear(true)
      .write( atok.slice(offset, offset + matched) )

    self.xx = self.yy === prevY
      // No newline, increase the column
      ? self.xx + matched
      // Column reset
      : matched - self.xx
  }

  // On NL match: increase the number of lines, reset the column
  function count () {
    self.yy++
    self.xx = self.atokNL.offset
  }

  this.atokNL = new Atok()
    .quiet(true).addRule('', '\r\n', count)
    .saveRuleSet('crnl')
    .clearRule()
    .quiet(true).addRule('', '\n', count)
    .saveRuleSet('nl')
}
Tracker.prototype.clear = function () {
  this.x = 0 // Current column
  this.y = 1 // Current line number

  this.xx = 0 // Current column including the matched token
  this.yy = 0 // Number of lines in the matched token
}
/**
 * type (String): platform type - determines the newline characters.
 *   If not set, uses the platform one
 */
Tracker.prototype.start = function (type) {
  if (this.running) return

  var _type = typeof type === 'string'
    ? type
    : process.platform
  
  this.running = true
  this.clear()

  this.atokNL.loadRuleSet(
    /win/.test( _type.toLowerCase() ) ? 'crnl' : 'nl'
  )

  var self = this

  wrapMethod(this.atok, 'clear', function () {
    self.clear()
  })

  function trackWrapper (args, res) {
    // Bail on unsuccessful match
    if (res < 0) return
    self.check(args[1], res)
  }

  this.atok._rulesForEach(function (rule) {
    wrapMethod(rule, 'test', trackWrapper)
  })
}

Tracker.prototype.stop = function () {
  if (!this.running) return

  this.running = false

  wrapMethod(this.atok, 'clear')

  this.atok._rulesForEach(function (rule) {
    wrapMethod(rule, 'test')
  })
}

module.exports = Tracker