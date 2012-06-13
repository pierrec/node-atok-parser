/*
 * Simple XML parser:
 * - tag attributes must be quoted
 * - only a subset of xml entities are replaced, overwrite Parser.ENTITIES for more
 * - encoding is not processed (utf-8 by default)
 */
// Parser events
var events = {
		processinginstruction: 1
	, comment: 1
	, opentag: 1
	, attribute: 1
	, text: 1
	, closetag: 1
	, opencdata: 0
	, cdata: 1
	, closecdata: 0
	, doctype: 1
	}

function xmlParser (options) {
	this.error = null

	// XML special entities
	var entityRex = /&(.+?);/mg
	// Modify ENTITIES as required (only typical subset defined here)
	var entityToCodeMap = this.ENTITIES = { apos: 0x0027, quot: 0x0022, amp: 0x0026, lt: 0x003C, gt: 0x003E, nbsp: 0x00A0 }

	// Parser variables
	var nameCharSet = { start: 'aA0_:-.', end: 'zZ9_:-.' }
	var tagNameStack = []		// Current tag hierarchy
	var attrName = null			// Current attribute name
	var procName = null			// Current processing instruction name

	function entityToCode (str, ent) {
		return String.fromCharCode(
			ent[0] !== '#'
				? entityToCodeMap[ent]
				: ent[1] === 'x'
					? parseInt(ent.substr(2), 16)
					: parseInt(ent.substr(1), 10)
		)
	}
	function decodeValue (v) {
		return v.replace(entityRex, entityToCode)
	}

	function setProcInst (name) {
		procName = name
	}
	function procInst (body) {
		self.emit('processinginstruction', { name: procName, body: body })
		procName = null
	}
	function initdoctype (n) {
		atok.offset -= 9			// Trick to leverage the match() helper
	}
	function doctype (n) {
		// Rule ran with quiet(), so we only perform one slice()
		self.emit(
			'doctype'
		, atok.buffer.slice( atok.offset - n + 8, atok.offset - 1 )
		)
	}
	function attrFound (attr) {
		attr.value = decodeValue( attr.value )
		self.emit('attribute', attr)
		attrName = null
	}
	function opentag (tag) {
		tagNameStack.push(tag)
		self.emit('opentag', tag)
	}
	function selfclosetag () {
		self.emit('closetag', tagNameStack.pop())
	}
	function closetag (tag) {
		if ( tagNameStack.length > 0 && tagNameStack.pop() === tag )
			return self.emit('closetag', tag)

		self.pause()
		self.emit('error', new Error('Invalid closetag: ' + tag))
	}
	function setError (err) {
		return function () {
			error(err)
		}
	}
	function error (err) {
		self.error = err
		self.pause()
		self.emit('error', err)
	}

	atok
		// Main loop
		.whitespace()
		.ignore(true).next('starttag')
			.addRule('<', 'starttag')
		.ignore()
			.addRule('', '<', function text (data) { self.emit('text', decodeValue(data)) })
		.saveRuleSet('main')

		// Opening/closing tag
		.clearRule()
		.next('attributes')
			.chunk(nameCharSet, opentag)
		.next()
		.continue(0, 1).ignore(true)
				.addRule('/', 'closetag')
		.next('closetag').ignore()
				.chunk(nameCharSet, closetag)
		.next('special').ignore(true)
			.addRule('!', 'special')
		.next().ignore()
				.addRule( setError(new Error('Parse error: invalid tag')) )
		.saveRuleSet('starttag')

		.clearRule()
		.next('main')
			.wait('--', '-->', function comment (c) { self.emit('comment', c) })
		.next('cdata').quiet(true)
			.addRule('[CDATA[', function opencdata () { self.emit('opencdata') })
		.next('doctype')
			.addRule('DOCTYPE', initdoctype)
		.next().quiet()
				.addRule( setError(new Error('Parse error: invalid ! tag')) )
		.saveRuleSet('special')

		// Emit the CDATA in chunks
		.clearRule()
		.next('main')
			.addRule(']]>', function emptycdata (c) { self.emit('closecdata') })
			.addRule('', ']]>', function trailingcdata (c) { self.emit('cdata', c); self.emit('closecdata') })
		.next()
			.addRule('', function cdata (c) { self.emit('cdata', c) })
		.saveRuleSet('cdata')

		// Process the DOCTYPE
		.clearRule()
		.next('main').quiet(true)
			.match('<', '>', doctype)
		.saveRuleSet('doctype')

		// Tag attributes
		.clearRule()
		.whitespace()
		.next('main')
			.ignore(true)
				.addRule('>', 'tag')
			.ignore()
		.saveRuleSet('closetag')
			.addRule('/>', selfclosetag)
		.next()
		.nvp(nameCharSet, '=', { firstOf: '> \t\n\r' }, attrFound)
		.saveRuleSet('attributes')
		
		// Processing instruction
		.clearRule()
		.whitespace()
		.continue(0).ignore(true)
			.addRule({ start: 256, end: Infinity }, 'non-ascii')
		.continue(1, 0)
			.addRule('<?', 'pi')
		// No PI, start parsing
		.ignore().next('main')
			.noop()
		// PI
		.continue(0, 1).next()
			.chunk(nameCharSet, setProcInst)
		.next('main')
			.wait('', '?>', procInst)
		.next()
			.addRule( setError(new Error('Parse error: invalid ? tag')) )
}

var Parser = require('..').createParser(xmlParser, 'options', events)

// Instantiate a parser
var p = new Parser

// Listen to all events and log their data
Object.keys(events).forEach(
	function (event) {
			p.on(event, events[event]
			? function (data) { console.log(event, data) }
			: function () { console.log(event) }
		)
	}
)

p.on('end', function () {
	console.timeEnd('xml')
})

// p.debug(console.log)
// Parse an XML stream
console.time('xml')
if (process.argv[2]) {
	require('fs').createReadStream( process.argv[2] ).pipe(p)
} else {
	// p.end('<a><b></c></b></a>')
	p.end('<!DOCTYPE <abc> 123 456><a a="true" b="__">123</a><b><c>456</c> <d>&amp;</d></b>')
	// p.write('<item>\n')
	// p.write('  one <a>1</a>')
	// p.write('  two <a>2</a>')
	// p.end('</item>\n')
}
