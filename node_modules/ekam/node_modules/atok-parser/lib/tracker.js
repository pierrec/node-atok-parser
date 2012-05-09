var Atok = require('atok')
// var Atok = require('../../node-atok')

// Wrap a method with a given function
// Function gets the set of arguments and result of the wrapped method
function wrapMethod (self, method, fn) {
  var prevMethod = fn ? self[method] : self[method].prevMethod

  if (fn) { // Wrap
    self[method] = function () {
      var res = prevMethod.apply(self, arguments)
      fn(arguments, res)
      return res
    }
    // Save the previous method
    self[method].prevMethod = prevMethod
  } else if (prevMethod) { // Unwrap
    self[method] = prevMethod
  }
}

function Tracker (atok) {
  var self = this

  this.atok = atok
  this.running = false

  this.clear()
  this._x = 0

  // Count the number of newlines in the last match
  this.check = function (offset, matched) {
    self.x = self.xx
    self.y += self.yy

    self.xx = self.x
    self.yy = 0
    self._x = 0
    self.atokNL
      .clear(true)
      .write( atok._slice(offset, offset + matched) )    
    
    self.xx += matched - self._x
  }

  function count () {
    self.yy++
    self._x = self.x + self.atokNL.bytesRead
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
**/
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
    if (res < 0) return
    self.check(args[1], res)
  }

  this.atok._rulesForEach(function (rule) {
    wrapMethod(rule, 'test', trackWrapper)
  })
}

Tracker.prototype.end = function () {
  if (!this.running) return

  this.running = false

  wrapMethod(this.atok, 'clear')

  this.atok._rulesForEach(function (rule) {
    wrapMethod(rule, 'test')
  })
}

module.exports = Tracker