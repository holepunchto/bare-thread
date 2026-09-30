const state = new Int32Array(Bare.Thread.self.data)

try {
  state[0] = require('dep')
} catch {
  state[0] = 3
}
