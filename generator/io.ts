/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import path from "path";
import fs from "fs";
import { Writable } from "stream";

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

export interface IO<O extends Writable = Writable> {
  w: (str: string) => void;
  w0: (str: string) => void;
  copy: (file: string) => void;
  out: O;
}

export function initTestIO(): IO<TestWritable> {
  const out = new TestWritable();
  return {
    /** write to file with newline */
    w: (s: string) => out.write(s + "\n"),
    /** same as w() but no newline */
    w0: (s: string) => out.write(s),
    copy(_file) {},
    out,
  };
}

export function initIO(outFile: string): IO {
  const destDir = process.argv[3];
  let out: Writable;
  if (!destDir || !outFile) {
    out = new TestWritable();
  } else {
    out = fs.createWriteStream(path.resolve(process.cwd(), destDir, outFile), {
      flags: "w",
    });
  }

  return {
    /** write to file with newline */
    w(s: string) {
      out.write(s + "\n");
    },

    /** same as w() but no newline */
    w0(s: string) {
      out.write(s);
    },

    copy(file) {
      destDir &&
        fs.copyFileSync(
          file,
          path.resolve(process.cwd(), destDir, path.basename(file))
        );
    },

    out,
  };
}
