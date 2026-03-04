const test = require('brittle')
const { isMac } = require('which-runtime')
const Thread = require('.')

test('basic', (t) => {
  const thread = new Thread(require.resolve('./test/fixtures/basic/index.js'))
  thread.join()
  t.pass()
})

test('nested', (t) => {
  const thread = new Thread(require.resolve('./test/fixtures/nested/a.js'))
  thread.join()
  t.pass()
})

test('getThreadCPU', (t) => {
  if (isMac) {
    t.exception(() => Thread.getThreadCPU())
  } else {
    t.comment(Thread.getThreadCPU())
  }
})
