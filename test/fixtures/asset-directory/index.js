const state = new Int32Array(Bare.Thread.self.data)

try {
  state[0] = require('./lib')().endsWith('dir') ? 1 : 2
} catch {
  state[0] = 3
}
