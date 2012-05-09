var path = require('path')

echo('Building...')

var dir = path.join( __dirname, 'output' )
mkdir( dir )
cd( dir )
echo(
	'//var DEBUG=1\n'
).to('in.js')
echo([
	'//include("in.js")'
,	'//if(DEBUG)console.log("debug")//endif'
,	'//if(!DEBUG)console.log("no debug")//endif'
].join('\n')
).to('out.js')

build({input: { include: 'output/*'}, output: {path: '.'}})
