/*
 * Simple XML parser:
 * - attribute names do not support non ASCII characters
 * - only a subset of xml entities are replaced, overwrite Parser.ENTITIES for more
 * - encoding set from the XML is not processed (utf-8 by default)
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
	function attrFound (attr, idx) {
		attr.value = decodeValue( attr.value )
		self.emit('attribute', attr)
		attrName = null
		// Unquoted value?
		if (idx >= 0) {
			atok.offset--
			atokTracker.xx--
		}
	}
	function opentag (tag) {
		tagNameStack.push(tag)
		self.emit('opentag', tag)
		atok.offset--
		atokTracker.xx--
	}
	function selfclosetag () {
		self.emit('closetag', tagNameStack.pop())
	}
	function closetag (tag) {
		var currentTag = tagNameStack.pop()
		if ( currentTag === tag ) {
			self.emit('closetag', tag)
			atok.offset--
			atokTracker.xx--
		} else {
			console.log(atok.buffer)
			setError( new Error('Invalid closetag: ' + tag + ' !== ' + currentTag) )(tag)
		}
	}
	function setError (err) {
		return function (data) {
			// error() is a pre defined function to format the error and pause the stream
			self.emit('error', error(err, data))
			// Initialize
			atok.clear(true).loadRuleSet('main')
		}
	}

	// Expect a tag - wait() is used we know there must be a tag (starting or ending)
	function getTag (handler) {
		return atok.wait('', { firstOf: '>/ \t\n\r' }, handler)
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
		.next('special').ignore(true)
			.addRule('!', 'special')
		.next().ignore()
		.continue(0, 1).ignore(true)
				.addRule('/', 'closetag')
		.continue().ignore()
		.next('closetag')

	getTag(closetag)
		.next('attributes')

	getTag(opentag)
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
		// Attributes do not support non ASCII characters
		.nvp(nameCharSet, '=', { firstOf: '/> \t\n\r' }, attrFound)
		.saveRuleSet('attributes')
		
		// Processing instruction
		.clearRule()
		.whitespace()
		.continue(0).ignore(true)
			.addRule({ start: 256, end: Infinity }, 'non-ascii')
		.continue(1, 0)
			.addRule('<?', 'pi')
		.continue()
		// No PI, start parsing
		.ignore().next('main')
			.noop()
		// PI
		.continue(0, 1).next()
			.chunk(nameCharSet, setProcInst)
		.continue()
		.next('main')
			.wait('', '?>', procInst)
		.next()
			.addRule( setError(new Error('Parse error: invalid ? tag')) )
}

var Parser = require('..').createParser(xmlParser, 'options', events)

// Instantiate a parser
var p = new Parser

p.on('end', function () {
	console.timeEnd('xml')
})

// Parse an XML stream
console.time('xml')
if (process.argv[2]) {
	// From a supplied file name
	require('fs').createReadStream( process.argv[2] ).pipe(p)
} else {
	// For logging only
	// Listen to all events and log their data
	Object.keys(events)
	.filter(function (event) {
		return events.hasOwnProperty(event) && !/^(error|end|drain|debug|newListener|oldListener)$/.test(event)
	})
	.forEach(
		function (event) {
				p.on(event, events[event]
				? function (data) { console.log('[' + event + ']', data) }
				: function () { console.log('[' + event + ']') }
			)
		}
	)
	// Enable line and column tracking - displayed upon error
	p.track(true)

	// Should get an error
	p.on('error', console.log)
	p.write('<a><b></c></b></a>')

	// Upon error, we should be able to resume processing (with a cleaned buffer in this case)
	// p.resume()

	// Stop tracking
	p.track()

	// Should parse both items and the associated a tag
	p.write('<!DOCTYPE encoding = "<ignored>" >')
	p.write('<item a="true" b="__">\n')
	p.write('  one <a>1</a>')
	p.write('  two <a>2</a>')
	p.write('<selfclosed scname=scvalue></selfclosed>')
	p.end('</item>\n')
}
