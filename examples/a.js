var p = require('..')
var Parser = p.createParser(my)
var tok = new Parser

function my () {
  atok
  .quiet(true)
  .nvp().on('data', console.log)
}

tok.write('_name="_value"')
