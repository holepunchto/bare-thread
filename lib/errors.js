module.exports = class ThreadError extends Error {
  constructor(msg, code, fn = ThreadError) {
    super(`${code}: ${msg}`)
    this.code = code

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, fn)
    }
  }

  get name() {
    return 'ThreadError'
  }

  static NAME_OVERFLOW(msg) {
    return new ThreadError(msg, 'NAME_OVERFLOW', ThreadError.TITLE_OVERFLOW)
  }
}
