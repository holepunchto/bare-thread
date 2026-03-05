const test = require('brittle')
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

test('Thread.cpu', (t) => {
  t.comment(Thread.cpu)
})

test('name property', (t) => {
  const thread = new Thread(require.resolve('./test/fixtures/basic/index.js'))

  thread.name = 'bare-test'

  t.is(thread.name, 'bare-test')

  thread.join()
})
