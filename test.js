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

test('priority', (t) => {
  const thread = new Thread(require.resolve('./test/fixtures/basic/index.js'))

  const defaultPriority = thread.priority

  thread.priority = Thread.constants.priority.PRIORITY_BELOW_NORMAL

  t.ok(thread.priority !== defaultPriority)

  thread.join()
})
