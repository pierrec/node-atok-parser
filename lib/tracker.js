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

}
Tracker.prototype.clear = function () {
  this.x = 1 // Current column
  this.y = 1 // Current line number

  this.xx = 0
}
/**
 * Count the number of newlines in the last match
 */
Tracker.prototype.check = function (buffer, offset, matched) {
  this.x = this.xx

  for (var start = 0, i = 0; i < matched; i++) {
    if (buffer[offset + i] === '\n') {
      // On NL match: increase the number of lines, reset the column
      this.y++
      this.xx = 0
      start = i + 1
    }
  }
  this.xx += matched - start
}
/**
 * Start tracking line and column numbers
 */
Tracker.prototype.start = function () {
  if (this.running) return

  this.running = true
  this.clear()

  var self = this

  wrapMethod(this.atok, 'clear', function () {
    self.clear()
  })

  function trackWrapper (args, res) {
    // Bail on unsuccessful match
    if (res < 0) return
    self.check(args[0], args[1], res)
  }

  this.atok._rulesForEach(function (rule) {
    wrapMethod(rule, 'test', trackWrapper)
  })
}
/**
 * Stop tracking line and column numbers
 */
Tracker.prototype.stop = function () {
  if (!this.running) return

  this.running = false

  wrapMethod(this.atok, 'clear')

  this.atok._rulesForEach(function (rule) {
    // Do not unnecessarily wrap rules with 0 length
    if (rule.length !== 0) wrapMethod(rule, 'test')
  })
}

module.exports = Tracker