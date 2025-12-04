/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { Writable } from "node:stream";

export interface IO {
  w: (str: string) => void;
  w0: (str: string) => void;
  /**
   * End the stream and return a promise that resolves when it's flushed.
   *
   * Writable streams buffer data and flush asynchronously, so calling
   * stream.end() does not guarantee the data is written to disk. We need
   * to wait for the 'finish' event to know the file is complete.
   *
   * This wasn't needed when the generator only ran as a CLI because Node
   * flushes pending I/O on process exit. Now that tests call generate()
   * and continue running, we must explicitly wait for the streams.
   */
  end: () => Promise<void>;
}

// not a class because we want to destructure w and w0 in the calling code, and
// if it was a class, they would lose their 'this' on destructure
export function initIO(out: Writable): IO {
  return {
    w: (s: string) => out.write(s + "\n"),
    /** same as w() but no newline */
    w0: (s: string) => out.write(s),
    end: () =>
      new Promise((resolve, reject) => {
        out.on("finish", resolve);
        out.on("error", reject);
        out.end();
      }),
  };
}

/**
 * A test stream that stores a buffer internally
 */
export class TestWritable extends Writable {
  private buffer: Uint8Array = new Uint8Array(0);

  _write(
    chunk: Uint8Array,
    _encoding: BufferEncoding,
    callback: (error?: Error | null) => void
  ): void {
    const result = new Uint8Array(this.buffer.length + chunk.length);
    result.set(this.buffer, 0);
    result.set(chunk, this.buffer.length);
    this.buffer = result;
    callback();
  }

  value(): string {
    return Buffer.from(this.buffer).toString().trim();
  }

  clear(): void {
    this.buffer = new Uint8Array(0);
  }
}
