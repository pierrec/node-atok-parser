var Atok = require('atok')
var slice = Array.prototype.slice

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
  
  // Overload `clear()`
  var clear = atok.clear
  atok.clear = function () {
    self.clear()
    clear.apply( atok, slice.call(arguments, 0) )
  }
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
  var _type = typeof type === 'string'
    ? type
    : process.platform
  
  this.running = true
  this.clear()

  if ( /win/.test( _type.toLowerCase() ) ) {
    this.atokNL.loadRuleSet('crnl')
  } else {
    this.atokNL.loadRuleSet('nl')
  }

  this.atok.matchEventHandler = this.check
}

Tracker.prototype.end = function () {
  this.running = false
  this.atok.matchEventHandler = null
}

module.exports = Tracker