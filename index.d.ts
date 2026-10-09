import Buffer from 'bare-buffer'
import URL from 'bare-url'
import { BundleToBufferOptions } from 'bare-bundle'
import Constants from './lib/constants'

interface Thread {
  readonly joined: boolean

  join(): void

  suspend(linger?: number): void
  wakeup(deadline?: number): void

  resume(): void
  terminate(): void
}

interface ThreadOptions {
  data?: unknown
  transfer?: unknown[]
  stackSize?: number
  mount?: URL | string
}

declare class Thread {
  constructor(entry: Buffer | string, opts?: ThreadOptions)

  static readonly cpu: number | undefined

  static readonly id: number

  static get name(): string
  static set name(name: string | unknown)

  static priority: number
}

declare namespace Thread {
  export const isMainThread: boolean
  export const self: { readonly data: any } | null
  export const constants: Constants

  export function prepare(entry: URL | string, opts: BundleToBufferOptions): Buffer

  export function mountFor(entry: URL | string): string
}

export = Thread
