/*
 * Ekam Javascript include command tests
**/
var assert = require('assert')

describe('//include', function () {
  describe('with properly defined variables', function () {
    it('should set them', function (done) {
      assert.deepEqual(args[0], null)
      assert.equal(typeof args[1], 'function')

      done()
    })
  })
})