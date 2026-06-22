# bare-thread

Thread support for Bare. Threads run a JavaScript entry point on a dedicated OS thread, with its module graph bundled ahead of time.

```
npm i bare-thread
```

## Usage

```js
const Thread = require('bare-thread')

// Spawn a thread from a module entry point. Its dependency graph is bundled
// and handed to the thread to run in isolation.
const thread = new Thread(require.resolve('./entry'))

// Block until the thread exits.
thread.join()
```

## API

#### `const thread = new Thread(entry[, options])`

Spawn a new thread. `entry` is either the path to a module entry point, which is resolved and bundled with `Thread.prepare()`, or a `Buffer` containing an already prepared bundle. `options` are forwarded to the underlying `Bare.Thread`.

#### `thread.joined`

Whether the thread has been joined.

#### `thread.join()`

Block the calling thread until the spawned thread exits.

#### `thread.suspend([linger])`

Suspend the thread. `linger` optionally specifies how long to wait before the thread is suspended.

#### `thread.wakeup([deadline])`

Wake up a suspended thread. `deadline` optionally specifies a time by which the thread must wake up.

#### `thread.resume()`

Resume a suspended thread.

#### `thread.terminate()`

Terminate the thread.

#### `Thread.cpu`

The number of the CPU the calling thread is currently running on, or `null` if the platform does not support querying it.

#### `Thread.id`

The platform-specific identifier of the calling thread.

#### `Thread.name`

The name of the calling thread. Reading and writing this property gets and sets the name of the thread that accesses it. Assigning a non-string coerces it to a string with `toString()`.

#### `Thread.priority`

The scheduling priority of the calling thread. Assign one of the values in `Thread.constants.priority`.

#### `Thread.isMainThread`

Whether the calling thread is the main thread.

#### `Thread.self`

A reference to the calling thread.

#### `const bundle = Thread.prepare(entry[, options])`

Resolve and traverse the module graph rooted at `entry`, returning a `Buffer` containing the bundled sources. `entry` is a path that is resolved relative to the current working directory, unless `bare-thread` itself was loaded from within a bundle and `entry` resolves to a location inside that same bundle, in which case it is resolved and read back out of the bundle. `options` are forwarded to `Bundle.toBuffer()`. See <https://github.com/holepunchto/bare-bundle>.

The constructor calls this internally when given a path, so it only needs to be used directly when a bundle is to be prepared ahead of time or reused across threads.

#### `Thread.constants`

An object of constants.

```js
Thread.constants = {
  priority: {
    PRIORITY_LOWEST,
    PRIORITY_BELOW_NORMAL,
    PRIORITY_NORMAL,
    PRIORITY_ABOVE_NORMAL,
    PRIORITY_HIGHEST
  }
}
```

## License

Apache-2.0
