const test = require('brittle')
const fs = require('bare-fs')
const path = require('bare-path')
const lex = require('bare-module-lexer')
const Bundle = require('bare-bundle')
const { pathToFileURL } = require('bare-url')
const Thread = require('.')

test('basic', (t) => {
  const thread = new Thread(require.resolve('./test/fixtures/basic/index.js'))
  thread.join()
  t.pass()
})

test('joined', (t) => {
  t.plan(2)

  const thread = new Thread(require.resolve('./test/fixtures/basic/index.js'))
  t.is(thread.joined, false)
  thread.join()
  t.is(thread.joined, true)
})

test('nested', (t) => {
  const thread = new Thread(require.resolve('./test/fixtures/nested/a.js'))
  thread.join()
  t.pass()
})

test('from buffer', (t) => {
  const bundle = new Bundle().write('/index.js', "console.log('Hello world')", { main: true })
  const thread = new Thread(bundle.toBuffer())
  thread.join()
  t.pass()
})

test('Thread.cpu', (t) => {
  t.comment(Thread.cpu)
})

test('name property', (t) => {
  Thread.name = 'bare-test'

  t.is(Thread.name, 'bare-test')
})

test('priority', (t) => {
  const defaultPriority = Thread.priority

  Thread.priority = Thread.constants.priority.PRIORITY_BELOW_NORMAL

  t.ok(Thread.priority !== defaultPriority)
})

test('Thread.id', (t) => {
  t.comment(Thread.id)
})

test('deferred require of a module loaded in this thread', (t) => {
  // Loading the module here records the specifiers it resolves on the way in,
  // but not the one behind its deferred `require()`. The thread must still be
  // given a bundle that holds it.
  t.is(require('./test/fixtures/deferred/lib').eager, 'eager')

  const data = new SharedArrayBuffer(4)
  const thread = new Thread(require.resolve('./test/fixtures/deferred/index.js'), { data })
  thread.join()

  t.is(new Int32Array(data)[0], 1)
})

test('bundled thread', async (t) => {
  const run = await loadBundle(t, {
    '/worker.js': "new Int32Array(Bare.Thread.self.data)[0] = require('./dep')",
    '/dep.js': 'module.exports = 1'
  })

  t.is(run('./worker.js'), 1)
})

test('bundled thread, import redirected within the bundle', async (t) => {
  const run = await loadBundle(
    t,
    {
      '/worker.js': "new Int32Array(Bare.Thread.self.data)[0] = require('./dep')",
      '/dep.js': 'module.exports = 1',
      '/redirect.js': 'module.exports = 2'
    },
    {
      '/worker.js': { './dep': '/redirect.js' }
    }
  )

  t.is(run('./worker.js'), 2)
})

test('bundled thread, import redirected out of the bundle', async (t) => {
  const run = await loadBundle(
    t,
    {
      '/worker.js': "new Int32Array(Bare.Thread.self.data)[0] = require('./dep')"
    },
    {
      '/worker.js': {
        './dep': pathToFileURL(require.resolve('./test/fixtures/redirect')).href
      }
    }
  )

  t.is(run('./worker.js'), 2)
})

test('bundled thread, import redirected in a dependency', async (t) => {
  const run = await loadBundle(
    t,
    {
      '/worker.js': "new Int32Array(Bare.Thread.self.data)[0] = require('./lib')",
      '/lib.js': "module.exports = require('./dep')",
      '/dep.js': 'module.exports = 1',
      '/redirect.js': 'module.exports = 2'
    },
    {
      '/lib.js': { './dep': '/redirect.js' }
    }
  )

  t.is(run('./worker.js'), 2)
})

// Writes a bundle holding the given files and a copy of `bare-thread`, and
// loads it from disk. The returned function runs one of the files in a thread
// spawned from within the bundle and returns the value it stored in the thread
// data.
async function loadBundle(t, files, resolutions = {}) {
  const dir = await t.tmp()

  const source = fs.readFileSync(require.resolve('.'))

  const bundle = new Bundle()
    .write(
      '/index.js',
      `
      const Thread = require('bare-thread')

      module.exports = function run(entry, data) {
        new Thread(require.resolve(entry), { data }).join()
      }
      `,
      { main: true }
    )
    .write('/node_modules/bare-thread/index.js', source)

  for (const [key, source] of Object.entries(files)) bundle.write(key, source)

  // The dependencies of `bare-thread` live outside the bundle and so must be
  // redirected to their location on disk.
  const imports = {}

  for (const { specifier } of lex(source).imports) {
    imports[specifier] = pathToFileURL(require.resolve(specifier)).href
  }

  bundle.resolutions = {
    '/index.js': { 'bare-thread': '/node_modules/bare-thread/index.js' },
    '/node_modules/bare-thread/index.js': imports,
    ...resolutions
  }

  const file = path.join(dir, 'app.bundle')

  fs.writeFileSync(file, bundle.toBuffer())

  const run = require(file)

  return function (entry) {
    const data = new SharedArrayBuffer(4)
    t.execution(() => run(entry, data))
    return new Int32Array(data)[0]
  }
}
