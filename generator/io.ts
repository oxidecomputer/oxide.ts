/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { Writable } from "stream";

export interface IO {
  w: (str: string) => void;
  w0: (str: string) => void;
}

// not a class because we want to destructure w and w0 in the calling code, and
// if it was a class, they would lose their 'this' on destructure
export function initIO(out: Writable) {
  return {
    w: (s: string) => out.write(s + "\n"),
    /** same as w() but no newline */
    w0: (s: string) => out.write(s),
  };
}

/**
 * A test stream that stores a buffer internally
 */
export class TestWritable extends Writable {
  private buffer: Buffer = Buffer.from("");

  _write(
    chunk: Buffer,
    _encoding: BufferEncoding,
    callback: (error?: Error | null) => void
  ): void {
    this.buffer = Buffer.concat([this.buffer, chunk]);
    callback();
  }

  value(): string {
    return this.buffer.toString().trim();
  }

  clear(): void {
    this.buffer = Buffer.from("");
  }
}
