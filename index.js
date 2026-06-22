const Bundle = require('bare-bundle')
const traverse = require('bare-module-traverse')
const { startsWithWindowsDriveLetter } = require('bare-module-resolve')
const { pathToFileURL } = require('bare-url')
const constants = require('./lib/constants')
const binding = require('./binding')

const { protocol, imports, resolutions } = module

module.exports = exports = class Thread {
  constructor(entry, opts = {}) {
    let source

    if (Buffer.isBuffer(entry)) source = entry
    else source = Thread.prepare(entry, { shared: true })

    this._thread = new Bare.Thread('bare:/thread.bundle', { ...opts, source })
  }

  get joined() {
    return this._thread.joined
  }

  join() {
    this._thread.join()
  }

  suspend(linger) {
    this._thread.suspend(linger)
  }

  wakeup(deadline) {
    this._thread.wakeup(deadline)
  }

  resume() {
    this._thread.resume()
  }

  terminate() {
    this._thread.terminate()
  }

  [Symbol.for('bare.inspect')]() {
    return {
      __proto__: { constructor: Thread },

      joined: this.joined
    }
  }

  static get cpu() {
    return binding.getCPU()
  }

  static get id() {
    return binding.getID()
  }

  static get name() {
    return binding.getName()
  }

  static set name(name) {
    if (typeof name !== 'string') name = name.toString()

    binding.setName(name)
  }

  static get priority() {
    return binding.getPriority()
  }

  static set priority(priority) {
    binding.setPriority(priority)
  }
}

exports.isMainThread = Bare.Thread.isMainThread

exports.self = Bare.Thread.self

exports.prepare = function prepare(entry, opts) {
  if (startsWithWindowsDriveLetter(entry)) entry = '/' + entry

  let base = pathToFileURL('./')

  // If `bare-thread` itself was loaded from within a bundle, its module URL
  // contains a `.bundle` segment. When the entry resolves to a location inside
  // that same bundle, prepare it relative to the bundle so that its sources are
  // read back out of the bundle rather than from disk.
  const root = bundleURL(module.url)

  if (root !== null) {
    const resolved = new URL(entry, root)

    if (resolved.href.startsWith(root.href)) base = root
  }

  entry = new URL(entry, base)

  const bundle = new Bundle()

  for (const dependency of traverse(
    entry,
    {
      imports,
      resolutions,
      resolve: traverse.resolve.bare
    },
    readModule
  )) {
    const { url, source, imports } = dependency

    bundle.write(url.href, source, {
      main: url.href === entry.href,
      imports
    })
  }

  return bundle.toBuffer(opts)
}

function readModule(url) {
  if (protocol.exists(url)) return protocol.read(url)

  return null
}

function bundleURL(url) {
  const segments = url.pathname.split('/')

  let i = -1

  for (let j = 0; j < segments.length; j++) {
    if (segments[j].endsWith('.bundle')) i = j
  }

  if (i === -1) return null

  return new URL(segments.slice(0, i + 1).join('/') + '/', url)
}

exports.constants = constants
