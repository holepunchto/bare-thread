const test = require('brittle')
const Thread = require('.')

test('basic', (t) => {
  const thread = new Thread(require.resolve('./test/fixtures/basic/index.js'))
  thread.join()
  t.pass()
})
